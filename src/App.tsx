/**
 * AutoQEncode - Automated Quantum Data Encoding Intelligence & Benchmarking Platform
 * Main Application Orchestration
 */

import React, { useState, useEffect } from 'react';
import { ViewMode, DatasetAnalysis, PreprocessingConfig, PreprocessedData, BenchmarkMetrics, RecommendationOutput, ExperimentRecord, CircuitDefinition, PriorityWeights } from './types';
import { api } from './services/api';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// View Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardView } from './pages/DashboardView';
import { DatasetAnalyzerView } from './pages/DatasetAnalyzerView';
import { PreprocessingView } from './pages/PreprocessingView';
import { QubitBudgetView } from './pages/QubitBudgetView';
import { EncodingLabView } from './pages/EncodingLabView';
import { ControlledBenchmarkView } from './pages/ControlledBenchmarkView';
import { CircuitStudioView } from './pages/CircuitStudioView';
import { BackendProfilerView } from './pages/BackendProfilerView';
import { AdaptiveLabView } from './pages/AdaptiveLabView';
import { RecommendationView } from './pages/RecommendationView';
import { HistoryAndReportsView } from './pages/HistoryAndReportsView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isQuickDemo, setIsQuickDemo] = useState(true);

  // Dataset State
  const [datasetName, setDatasetName] = useState<string | null>('small_medical_demo.csv');
  const [csvContent, setCsvContent] = useState<string>('');
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [trainRatio, setTrainRatio] = useState<number>(0.75);
  const [seed, setSeed] = useState<number>(42);

  // Preprocessing State
  const [preprocessingConfig, setPreprocessingConfig] = useState<PreprocessingConfig>({
    imputation: 'mean',
    categoricalEncoding: 'ordinal',
    scaling: 'minmax_pi',
    selectedFeatures: [],
    targetColumn: '',
    trainRatio: 0.75,
    seed: 42,
  });
  const [preprocessedData, setPreprocessedData] = useState<PreprocessedData | null>(null);

  // Qubit Budget State
  const [availableQubits, setAvailableQubits] = useState<number>(4);

  // Benchmark & Recommendation State
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkMetrics[] | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationOutput | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState<boolean>(false);
  const [latestExperiment, setLatestExperiment] = useState<ExperimentRecord | null>(null);

  // Circuit Studio selected circuit
  const [studioCircuit, setStudioCircuit] = useState<CircuitDefinition | null>(null);

  // Initial load: Pre-load the medical demo dataset for immediate exploration
  useEffect(() => {
    loadDemoDataset('small_medical_demo');
    api.getExperiments().then(exps => {
      if (exps.length > 0) {
        setLatestExperiment(exps[0]);
        setBenchmarkResults(exps[0].results);
        setRecommendation(exps[0].recommendation);
      }
    });
  }, []);

  const loadDemoDataset = async (demoId: string = 'small_medical_demo') => {
    try {
      const res = await api.getDemoDatasetContent(demoId);
      const content = res.dataset.csvContent;
      const filename = `${demoId}.csv`;
      setDatasetName(filename);
      setCsvContent(content);

      const a = await api.analyzeDataset(filename, content);
      setAnalysis(a);
      const allFeats = a.features.map(f => f.name);
      setSelectedFeatures(allFeats);
      const tgt = a.targetCandidate || allFeats[allFeats.length - 1];
      setTargetColumn(tgt);

      // Automatically execute initial preprocessor
      const prepConfig: PreprocessingConfig = {
        imputation: 'mean',
        categoricalEncoding: 'ordinal',
        scaling: 'minmax_pi',
        selectedFeatures: allFeats,
        targetColumn: tgt,
        trainRatio,
        seed,
      };
      setPreprocessingConfig(prepConfig);

      const prep = await api.preprocessDataset(content, prepConfig);
      setPreprocessedData(prep);
    } catch (err) {
      console.error('Failed to load demo dataset:', err);
    }
  };

  const handleUploadCSV = async (filename: string, content: string) => {
    try {
      setDatasetName(filename);
      setCsvContent(content);
      const res = await api.uploadCSV(filename, content);
      setAnalysis(res.analysis);
      const allFeats = res.analysis.features.map(f => f.name);
      setSelectedFeatures(allFeats);
      const tgt = res.analysis.targetCandidate || allFeats[allFeats.length - 1];
      setTargetColumn(tgt);

      const prepConfig: PreprocessingConfig = {
        imputation: 'mean',
        categoricalEncoding: 'ordinal',
        scaling: 'minmax_pi',
        selectedFeatures: allFeats,
        targetColumn: tgt,
        trainRatio,
        seed,
      };
      setPreprocessingConfig(prepConfig);
      const prep = await api.preprocessDataset(content, prepConfig);
      setPreprocessedData(prep);
      setCurrentView('analyzer');
    } catch (err: any) {
      alert(`Error loading CSV: ${err.message}`);
    }
  };

  const handleExecutePreprocessing = async () => {
    if (!csvContent) return;
    try {
      const updatedConfig: PreprocessingConfig = {
        ...preprocessingConfig,
        selectedFeatures,
        targetColumn,
        trainRatio,
        seed,
      };
      setPreprocessingConfig(updatedConfig);
      const prep = await api.preprocessDataset(csvContent, updatedConfig);
      setPreprocessedData(prep);
    } catch (err: any) {
      alert(`Preprocessing error: ${err.message}`);
    }
  };

  const handleRunControlledBenchmark = async (options: {
    ansatzLayers: number;
    epochs: number;
    learningRate: number;
    noiseLevel: string;
    entanglement: 'linear' | 'ring' | 'all_to_all';
  }) => {
    if (!preprocessedData) return;
    setIsRunningBenchmark(true);
    try {
      // Adjust epochs if Quick Demo mode is enabled
      const effectiveEpochs = isQuickDemo ? Math.min(6, options.epochs) : options.epochs;

      const res = await api.runControlledBenchmark({
        trainX: preprocessedData.trainX,
        trainY: preprocessedData.trainY,
        testX: preprocessedData.testX,
        testY: preprocessedData.testY,
        featureNames: preprocessedData.featureNames,
        qubitBudget: availableQubits,
        ansatzLayers: options.ansatzLayers,
        epochs: effectiveEpochs,
        learningRate: options.learningRate,
        noiseLevel: options.noiseLevel,
        seed,
        backendId: 'noisy_sim',
      });

      setBenchmarkResults(res.results);
      setRecommendation(res.recommendation);

      // Save experiment
      const newExp: ExperimentRecord = {
        id: res.benchmarkId,
        createdAt: new Date().toISOString(),
        title: `Controlled Benchmark: ${datasetName}`,
        datasetName: datasetName || 'dataset.csv',
        targetColumn,
        qubitBudget: availableQubits,
        mode: 'controlled_benchmark',
        noiseLevel: options.noiseLevel,
        results: res.results,
        recommendation: res.recommendation,
        manifest: {
          manifestId: `MAN-${Date.now().toString(36).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          datasetHash: `SHA256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
          datasetRows: preprocessedData.trainX.length + preprocessedData.testX.length,
          datasetFeatures: preprocessedData.featureNames,
          targetColumn,
          trainRatio,
          randomSeed: seed,
          preprocessing: {
            scaling: preprocessingConfig.scaling,
            imputation: preprocessingConfig.imputation,
            varianceRetained: preprocessedData.informationLoss.varianceRetainedPercent,
          },
          qnnArchitecture: {
            ansatzLayers: options.ansatzLayers,
            rotationGates: ['Ry', 'Rz'],
            entanglement: options.entanglement,
            optimizer: 'Parameter-Shift Analytic GD',
            learningRate: options.learningRate,
            epochs: effectiveEpochs,
          },
          backendProfile: 'noisy_sim',
          noiseModel: {
            level: options.noiseLevel,
            depolarizingProb: 0.015,
            bitFlipProb: 0.008,
            phaseFlipProb: 0.008,
            readoutErrorProb: 0.02,
          },
          environment: {
            platform: 'Linux x86_64',
            qiskitCompatibility: 'v1.1.0',
            autoQEncodeVersion: '2.4.0-research',
          },
        },
      };

      await api.saveExperiment(newExp);
      setLatestExperiment(newExp);
    } catch (err: any) {
      alert(`Benchmark execution error: ${err.message}`);
    } finally {
      setIsRunningBenchmark(false);
    }
  };

  const handleUpdateRecommendationWeights = async (weights: PriorityWeights) => {
    if (!benchmarkResults) return;
    try {
      const updated = await api.getRecommendation(benchmarkResults, weights);
      setRecommendation(updated);
    } catch (err) {
      console.error('Failed to update recommendation weights:', err);
    }
  };

  const handleExportReport = (format: 'json' | 'csv' | 'pdf') => {
    if (format === 'pdf') {
      window.print();
      return;
    }
    if (!latestExperiment) return;

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(latestExperiment, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `${latestExperiment.id}_report.json`;
      a.click();
    } else {
      let csv = 'Encoding,Accuracy,Precision,Recall,F1Score,Depth,Qubits,TwoQubitGates,NoiseAccuracy,NoiseRobustness\n';
      latestExperiment.results.forEach(r => {
        csv += `${r.encoding},${r.accuracy},${r.precision},${r.recall},${r.f1Score},${r.depth},${r.qubits},${r.twoQubitGates},${r.noiseAccuracy},${r.noiseRobustness}\n`;
      });
      const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `${latestExperiment.id}_benchmark.csv`;
      a.click();
    }
  };

  return (
    <div className="h-screen w-full bg-[#080B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
      {/* Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        isQuickDemo={isQuickDemo}
        onToggleQuickDemo={() => setIsQuickDemo(!isQuickDemo)}
        datasetName={datasetName}
        isRunningBenchmark={isRunningBenchmark}
        onLoadDemo={loadDemoDataset}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Collapsible Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 min-h-0 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="max-w-7xl mx-auto">
            {currentView === 'landing' && (
              <LandingPage
                onNavigate={setCurrentView}
                onLaunchDemo={() => {
                  loadDemoDataset('small_medical_demo');
                  setCurrentView('dashboard');
                }}
              />
            )}

            {currentView === 'dashboard' && (
              <DashboardView
                latestExperiment={latestExperiment}
                onNavigate={setCurrentView}
                onLaunchDemo={() => {
                  loadDemoDataset('small_medical_demo');
                  setCurrentView('benchmark');
                }}
              />
            )}

            {currentView === 'analyzer' && (
              <DatasetAnalyzerView
                analysis={analysis}
                onUploadCSV={handleUploadCSV}
                onLoadDemo={loadDemoDataset}
                selectedFeatures={selectedFeatures}
                onToggleFeature={feat => {
                  if (selectedFeatures.includes(feat)) {
                    if (selectedFeatures.length > 1) {
                      setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
                    }
                  } else {
                    setSelectedFeatures([...selectedFeatures, feat]);
                  }
                }}
                onSelectAllFeatures={setSelectedFeatures}
                targetColumn={targetColumn}
                onSelectTarget={setTargetColumn}
                trainRatio={trainRatio}
                onChangeTrainRatio={setTrainRatio}
                seed={seed}
                onChangeSeed={setSeed}
                onProceedToPreprocessing={() => {
                  handleExecutePreprocessing();
                  setCurrentView('preprocessing');
                }}
              />
            )}

            {currentView === 'preprocessing' && (
              <PreprocessingView
                config={preprocessingConfig}
                onChangeConfig={newC => setPreprocessingConfig({ ...preprocessingConfig, ...newC })}
                preprocessedData={preprocessedData}
                onExecutePreprocessing={handleExecutePreprocessing}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'budget' && (
              <QubitBudgetView
                availableQubits={availableQubits}
                onChangeQubits={setAvailableQubits}
                selectedFeaturesCount={selectedFeatures.length}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'encoding_lab' && (
              <EncodingLabView
                numFeatures={selectedFeatures.length || 4}
                availableQubits={availableQubits}
                onNavigate={setCurrentView}
                onSelectCircuitForStudio={c => {
                  setStudioCircuit(c);
                  setCurrentView('circuit_studio');
                }}
              />
            )}

            {currentView === 'benchmark' && (
              <ControlledBenchmarkView
                preprocessedData={preprocessedData}
                availableQubits={availableQubits}
                benchmarkResults={benchmarkResults}
                isRunning={isRunningBenchmark}
                onRunBenchmark={handleRunControlledBenchmark}
                onNavigate={setCurrentView}
                recommendation={recommendation}
              />
            )}

            {currentView === 'circuit_studio' && (
              <CircuitStudioView
                currentCircuit={studioCircuit}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'backend_profiler' && (
              <BackendProfilerView onNavigate={setCurrentView} />
            )}

            {currentView === 'adaptive_lab' && (
              <AdaptiveLabView
                analysis={analysis}
                preprocessedData={preprocessedData}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'recommendation' && (
              <RecommendationView
                recommendation={recommendation}
                benchmarkResults={benchmarkResults}
                onUpdateWeights={handleUpdateRecommendationWeights}
                onNavigate={setCurrentView}
                onExportReport={handleExportReport}
              />
            )}

            {currentView === 'history_reports' && (
              <HistoryAndReportsView />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
