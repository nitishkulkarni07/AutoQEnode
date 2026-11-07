import { FeatureStats, DatasetAnalysis } from '../../types';

export function parseCSV(csvContent: string): { headers: string[]; rows: Record<string, any>[] } {
  const lines = csvContent
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length !== headers.length) continue;

    const rowObj: Record<string, any> = {};
    for (let j = 0; j < headers.length; j++) {
      const raw = values[j];
      const num = Number(raw);
      rowObj[headers[j]] = !isNaN(num) && raw !== '' ? num : raw;
    }
    rows.push(rowObj);
  }

  return { headers, rows };
}

export function analyzeDataset(filename: string, headers: string[], rows: Record<string, any>[]): DatasetAnalysis {
  const totalRows = rows.length;
  const totalColumns = headers.length;

  if (totalRows === 0) {
    throw new Error('Dataset has zero valid rows.');
  }

  let targetCandidate = headers[headers.length - 1];
  for (const h of headers) {
    const lower = h.toLowerCase();
    if (lower === 'target' || lower === 'label' || lower === 'diagnosis' || lower === 'class' || lower.includes('risk')) {
      targetCandidate = h;
      break;
    }
  }

  const classDistribution: Record<string, number> = {};
  for (const r of rows) {
    const val = String(r[targetCandidate]);
    classDistribution[val] = (classDistribution[val] || 0) + 1;
  }

  const featureCols = headers.filter(h => h !== targetCandidate);
  const targetNumeric = rows.map(r => Number(r[targetCandidate]) || 0);

  let missingValuesTotal = 0;
  const features: FeatureStats[] = [];
  const scores: { name: string; mi: number; corr: number }[] = [];

  for (const f of featureCols) {
    const values = rows.map(r => r[f]);
    let missingCount = 0;
    const nums: number[] = [];

    const valueSet = new Set<any>();
    for (const v of values) {
      if (v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v))) {
        missingCount++;
      } else {
        valueSet.add(v);
        const n = Number(v);
        if (!isNaN(n)) nums.push(n);
      }
    }
    missingValuesTotal += missingCount;

    const uniqueValues = valueSet.size;
    let type: 'continuous' | 'binary' | 'categorical' = 'continuous';
    if (uniqueValues === 2) {
      type = 'binary';
    } else if (uniqueValues < 6 || nums.length < values.length * 0.8) {
      type = 'categorical';
    }

    let mean = 0, variance = 0, stdDev = 0, min = 0, max = 0, range = 0, sparsity = 0;
    if (nums.length > 0) {
      const sum = nums.reduce((a, b) => a + b, 0);
      mean = sum / nums.length;
      const varSum = nums.reduce((a, b) => a + (b - mean) ** 2, 0);
      variance = varSum / (nums.length || 1);
      stdDev = Math.sqrt(variance);
      min = Math.min(...nums);
      max = Math.max(...nums);
      range = max - min;
      sparsity = nums.filter(n => n === 0).length / nums.length;
    }

    const binCounts: Record<string, number> = {};
    for (const v of values) {
      const key = type === 'continuous' ? String(Math.floor((Number(v) - min) / ((range || 1) / 10))) : String(v);
      binCounts[key] = (binCounts[key] || 0) + 1;
    }
    let entropy = 0;
    for (const k in binCounts) {
      const p = binCounts[k] / totalRows;
      if (p > 0) entropy -= p * Math.log2(p);
    }

    let correlation = 0;
    if (nums.length === totalRows && targetNumeric.length === totalRows) {
      const targetMean = targetNumeric.reduce((a, b) => a + b, 0) / totalRows;
      let num = 0, den1 = 0, den2 = 0;
      for (let i = 0; i < totalRows; i++) {
        const dx = nums[i] - mean;
        const dy = targetNumeric[i] - targetMean;
        num += dx * dy;
        den1 += dx * dx;
        den2 += dy * dy;
      }
      correlation = den1 * den2 > 0 ? num / Math.sqrt(den1 * den2) : 0;
    }

    const mi = Math.abs(correlation) * 0.6 + (entropy / (Math.log2(10) || 1)) * 0.4;
    scores.push({ name: f, mi, corr: Math.abs(correlation) });

    let suggestedEncoding: 'basis' | 'angle' | 'amplitude' = 'angle';
    let encodingRationale = 'Continuous bounded feature suitable for Ry rotations.';

    if (type === 'binary') {
      suggestedEncoding = 'basis';
      encodingRationale = 'Binary 0/1 flag directly maps to |0> or |1> computational basis state with zero rotation error.';
    } else if (type === 'categorical') {
      suggestedEncoding = 'basis';
      encodingRationale = 'Discrete low-cardinality feature maps to discrete computational basis registers.';
    } else if (variance > 50 || range > 100) {
      suggestedEncoding = 'amplitude';
      encodingRationale = 'High dynamic range / dense magnitude suitable for normalized amplitude statevector.';
    }

    features.push({
      name: f,
      type,
      uniqueValues,
      missingCount,
      missingPercent: parseFloat(((missingCount / totalRows) * 100).toFixed(1)),
      mean: parseFloat(mean.toFixed(3)),
      variance: parseFloat(variance.toFixed(3)),
      stdDev: parseFloat(stdDev.toFixed(3)),
      min: parseFloat(min.toFixed(3)),
      max: parseFloat(max.toFixed(3)),
      range: parseFloat(range.toFixed(3)),
      sparsity: parseFloat(sparsity.toFixed(3)),
      entropy: parseFloat(entropy.toFixed(3)),
      targetCorrelation: parseFloat(correlation.toFixed(3)),
      mutualInformation: parseFloat(mi.toFixed(3)),
      selectionRank: 0,
      suggestedEncoding,
      encodingRationale,
    });
  }

  scores.sort((a, b) => b.mi - a.mi);
  scores.forEach((s, idx) => {
    const feat = features.find(f => f.name === s.name);
    if (feat) feat.selectionRank = idx + 1;
  });

  const correlationMatrix: { x: string; y: string; correlation: number }[] = [];
  for (let i = 0; i < featureCols.length; i++) {
    for (let j = 0; j < featureCols.length; j++) {
      const f1 = featureCols[i];
      const f2 = featureCols[j];
      if (i === j) {
        correlationMatrix.push({ x: f1, y: f2, correlation: 1.0 });
      } else {
        const v1 = rows.map(r => Number(r[f1]) || 0);
        const v2 = rows.map(r => Number(r[f2]) || 0);
        const m1 = v1.reduce((a, b) => a + b, 0) / totalRows;
        const m2 = v2.reduce((a, b) => a + b, 0) / totalRows;
        let num = 0, d1 = 0, d2 = 0;
        for (let k = 0; k < totalRows; k++) {
          const dx = v1[k] - m1;
          const dy = v2[k] - m2;
          num += dx * dy;
          d1 += dx * dx;
          d2 += dy * dy;
        }
        const c = d1 * d2 > 0 ? num / Math.sqrt(d1 * d2) : 0;
        correlationMatrix.push({ x: f1, y: f2, correlation: parseFloat(c.toFixed(3)) });
      }
    }
  }

  return {
    filename,
    totalRows,
    totalColumns,
    missingValuesTotal,
    duplicateRows: 0,
    numericalFeaturesCount: features.filter(f => f.type === 'continuous').length,
    categoricalFeaturesCount: features.filter(f => f.type !== 'continuous').length,
    targetCandidate,
    classDistribution,
    features,
    correlationMatrix,
    rawPreview: rows.slice(0, 8),
  };
}
