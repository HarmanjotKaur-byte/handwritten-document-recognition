import React from 'react';
import { 
  Layers, 
  ArrowDown, 
  Cpu, 
  Database, 
  Network, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Globe,
  FileText,
  Boxes,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function ModelArchitecture({ modelInfo }) {
  const provider = modelInfo?.provider || "Google DeepMind / Google AI Studio";
  const modelName = modelInfo?.model_name || "gemini-3.5-flash-lite";

  const pipelineStages = [
    {
      step: '1',
      title: 'Handwritten Document Ingestion',
      sub: 'Input Scans, Photos or Interactive Canvas Strokes',
      detail: 'Accepts arbitrary resolution PNG, JPG, JPEG, and WEBP image matrices. Preprocessing validates MIME headers, verifies dimensions, and extracts EXIF orientation tags.',
      icon: Layers
    },
    {
      step: '2',
      title: 'Preprocessing & Non-Destructive Normalization',
      sub: 'Orientation Alignment & Color Space Preservation',
      detail: 'Normalizes the image into standard RGB without aggressive morphological thinning or binarization, preserving natural pen stroke velocity, slant angles, and ink gradients.',
      icon: Sliders
    },
    {
      step: '3',
      title: 'Pretrained Cloud Vision Processing',
      sub: 'Google Cloud Vision / Gemini Multimodal Transformer',
      detail: 'High-resolution image patches are projected into deep semantic embeddings. Captures cursive character glyphs, ligature contours, and inter-word whitespace simultaneously.',
      icon: Cpu
    },
    {
      step: '4',
      title: 'Contextual Language Model Decoding',
      sub: 'Cross-Attention Sequence Generation',
      detail: 'Multimodal decoders project visual patch tokens into discrete textual tokens with sub-word language modeling, naturally resolving spelling ambiguity without external dictionaries.',
      icon: Network
    },
    {
      step: '5',
      title: 'Structured Output Normalization',
      sub: 'Hierarchical Document Structure (Pages, Blocks, Words)',
      detail: 'Normalizes generated transcription into structured lines, paragraphs, and words with latency telemetry and application budget tracking.',
      icon: Sparkles
    }
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
          <Globe className="h-3.5 w-3.5" />
          <span>Educational Reference & Technical Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Model Information & Educational Guide
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Detailed technical overview explaining Optical Character Recognition (OCR), handwriting transcription mechanics, Google Vision's document hierarchy, and how our production system integrates with externally hosted cloud models.
        </p>
      </div>

      {/* Model Attribution Alert */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3.5">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <p className="font-bold text-sm">External Model Attribution Notice</p>
          <p className="leading-relaxed">
            The handwriting recognition service is powered by <strong>Google Cloud Vision / Google Gemini Multimodal Vision API</strong> (specifically <code>{modelName}</code>). This is an externally hosted, enterprise-grade pretrained vision model provided by Google.
            <strong> We did not train this underlying foundation model.</strong> Our application provides the secure API orchestration, image preprocessing, strict usage budget controls, interactive canvas input, and document comparison workspace.
          </p>
        </div>
      </div>

      {/* Educational Section: What is OCR & Handwriting Recognition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
            <HelpCircle className="h-5 w-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">What is OCR?</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Optical Character Recognition (OCR)</strong> is the computational process of converting two-dimensional visual imagery containing text (such as scanned paper documents, photos of receipts, or camera feeds) into machine-readable digital character strings (UTF-8).
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Traditional OCR relies on standard font templates, morphological binarization, and horizontal line projections. While effective for crisp printed machine fonts, traditional OCR routinely collapses when faced with irregular cursive handwriting.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">What is Handwriting Recognition?</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Handwritten Text Recognition (HTR)</strong> is a significantly more complex branch of computer vision. Unlike uniform typography, handwritten text features infinite continuous variations in character curvature, ligature connections, slant angles, variable kerning, and baseline drift.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Modern HTR solves this through deep learning: rather than matching rigid templates, deep neural networks learn continuous representations of stroke kinematics and contextual grammar.
          </p>
        </div>
      </div>

      {/* Google Cloud Vision Document Hierarchy */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-5 w-5 text-blue-600" />
            <span>Google Document Text Detection Hierarchy</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Understanding the structural organization returned by <code>DOCUMENT_TEXT_DETECTION</code>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Level 1</span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Page</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              The root container representing the entire image canvas or page surface, including resolution and aspect ratio metadata.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Level 2</span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Block</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Distinct structural columns, text regions, or table cells isolated from neighboring elements.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Level 3</span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Paragraph</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              A continuous group of handwritten lines bounded by natural line wraps, line heights, or indentation breaks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Level 4</span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Word / Symbol</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Individual segmented word tokens and constituent character glyphs with discrete bounding polygons and confidence scores.
            </p>
          </div>
        </div>

        {/* Bounding boxes & Confidence explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200">Bounding Polygons & Boxes</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Every detected entity is associated with normalized vertex coordinates <code>[x, y]</code> defining the rectangular or polygonal boundary around the detected text stroke, enabling precise spatial alignment on document overlays.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200">Confidence Scores & Telemetry</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Confidence scores represent the normalized posterior probability assigned by the neural decoder to the chosen token sequence. We present genuine model confidence without fabricating artificial metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Pipeline */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
          End-to-End Processing Architecture
        </h3>

        <div className="relative space-y-6">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isLast = idx === pipelineStages.length - 1;

            return (
              <div key={idx} className="relative">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-blue-600/20">
                    {stage.step}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {stage.title}
                      </h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {stage.sub}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {stage.detail}
                    </p>
                  </div>
                </div>

                {!isLast && (
                  <div className="flex justify-center my-2">
                    <ArrowDown className="h-4 w-4 text-slate-400 dark:text-slate-600 animate-bounce" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Guardrails */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Operational Constraints & Guardrails</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <strong>Monthly Free Tier Budget Cap:</strong> Capped at 900 units/month. An application circuit breaker prevents requests when reaching the limit.
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <strong>15-Second Request Timeout:</strong> Unresponsive remote network calls are aborted to maintain client responsiveness.
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <strong>Max Payload Size (10MB):</strong> Large images are validated before transmission to conserve bandwidth and prevent memory exhaustion.
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <strong>Data Privacy & Ephemeral Processing:</strong> Uploaded images are held only in volatile RAM during inference; no document images are permanently stored.
          </div>
        </div>
      </div>
    </div>
  );
}
