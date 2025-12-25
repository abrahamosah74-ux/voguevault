'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useState as useStateCallback } from 'react';

interface ProcessingJob {
  id: string;
  filename: string;
  product_id: string;
  product_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  result?: {
    modelId: string;
    fileSize: number;
    vertexCount: number;
    triangleCount: number;
    compressionRatio: number;
    lodUrls: { high: string; medium: string; low: string };
    processingTimeMs: number;
  };
}

interface Material {
  id: string;
  name: string;
  material_type: string;
  base_color_hex: string;
  roughness: number;
  metallic: number;
  swatch_url?: string;
  price_per_sq_m: number;
  sustainability_score: number;
}

/**
 * Admin 3D Asset Management Dashboard
 * Handles model uploads, processing queue monitoring, and material library management
 */
const Admin3DAssetManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'uploads' | 'queue' | 'materials'>('uploads');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [newMaterialForm, setNewMaterialForm] = useState({
    name: '',
    material_type: 'fabric',
    base_color_hex: '#FFFFFF',
    roughness: 0.5,
    metallic: 0,
    price_per_sq_m: 0,
    sustainability_score: 50
  });

  /**
   * Handle file selection for upload
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['glb', 'gltf', 'fbx'].includes(ext || '')) {
        setError(`Invalid file type: ${file.name}. Allowed: GLB, GLTF, FBX`);
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Max: 100MB`);
        return false;
      }
      return true;
    });

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  /**
   * Remove file from upload queue
   */
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Submit files for processing
   */
  const submitFilesForProcessing = async () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    if (uploadedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newJobs: ProcessingJob[] = [];

      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('model', file);

        // Create job record
        const jobId = `job-${Date.now()}-${Math.random()}`;
        const job: ProcessingJob = {
          id: jobId,
          filename: file.name,
          product_id: selectedProduct,
          product_name: selectedProduct, // Would fetch from API
          status: 'pending',
          progress: 0,
          startedAt: new Date()
        };

        newJobs.push(job);
        setProcessingJobs((prev) => [...prev, job]);

        // Upload with progress tracking
        uploadFileWithProgress(file, jobId, selectedProduct);
      }

      setUploadedFiles([]);
      setSelectedProduct('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsLoading(false);
    }
  };

  /**
   * Upload file with progress tracking
   */
  const uploadFileWithProgress = async (
    file: File,
    jobId: string,
    productId: string
  ) => {
    const formData = new FormData();
    formData.append('model', file);

    try {
      // Simulate processing steps
      updateJobProgress(jobId, 'processing', 20);

      // Actual API call would go here
      const response = await fetch(
        `/api/admin/products/${productId}/3d-models`,
        {
          method: 'POST',
          body: formData,
          // Track upload progress
          // onUploadProgress: (progress) => {
          //   updateJobProgress(jobId, 'processing', 20 + (progress.loaded / progress.total) * 60);
          // }
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        updateJobProgress(jobId, 'processing', 80);

        // Simulate post-processing steps
        await new Promise((resolve) => setTimeout(resolve, 500));

        updateJobProgress(jobId, 'completed', 100);

        setProcessingJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'completed',
                  progress: 100,
                  completedAt: new Date(),
                  result: result.data.processing_stats
                }
              : job
          )
        );
      } else {
        updateJobProgress(jobId, 'failed', 0, result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed';
      updateJobProgress(jobId, 'failed', 0, message);
    }
  };

  /**
   * Update job progress
   */
  const updateJobProgress = (
    jobId: string,
    status: ProcessingJob['status'],
    progress: number,
    error?: string
  ) => {
    setProcessingJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status,
              progress,
              error,
              completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined
            }
          : job
      )
    );
  };

  /**
   * Fetch materials from API
   */
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/materials?limit=100');
      const data = await response.json();
      if (data.success) {
        setMaterials(data.data.materials);
      }
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch materials');
      setIsLoading(false);
    }
  };

  /**
   * Create new material
   */
  const createMaterial = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterialForm)
      });

      const data = await response.json();

      if (data.success) {
        setMaterials((prev) => [data.data, ...prev]);
        setNewMaterialForm({
          name: '',
          material_type: 'fabric',
          base_color_hex: '#FFFFFF',
          roughness: 0.5,
          metallic: 0,
          price_per_sq_m: 0,
          sustainability_score: 50
        });
        setError(null);
      } else {
        setError(data.error);
      }

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create material');
      setIsLoading(false);
    }
  };

  /**
   * Delete material
   */
  const deleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const response = await fetch(`/api/admin/materials/${materialId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      } else {
        setError('Failed to delete material');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete material');
    }
  };

  /**
   * Delete job and associated model
   */
  const deleteJob = async (jobId: string) => {
    const job = processingJobs.find((j) => j.id === jobId);
    if (!job || !job.result) {
      setError('Cannot delete job without model ID');
      return;
    }

    if (!confirm(`Delete model from ${job.filename}?`)) return;

    try {
      const response = await fetch(`/api/admin/3d-models/${job.result.modelId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProcessingJobs((prev) => prev.filter((j) => j.id !== jobId));
      } else {
        setError('Failed to delete model');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete model');
    }
  };

  /**
   * Filter jobs by status
   */
  const filteredJobs = processingJobs.filter((job) => {
    if (filterStatus === 'all') return true;
    return job.status === filterStatus;
  });

  /**
   * Get status badge color
   */
  const getStatusColor = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">3D Asset Management</h1>
          <p className="text-gray-400">
            Upload, process, and manage 3D models and materials for your products
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'uploads'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Model Uploads
          </button>
          <button
            onClick={() => {
              setActiveTab('queue');
              // Could fetch jobs here
            }}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'queue'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Processing Queue ({processingJobs.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('materials');
              if (materials.length === 0) fetchMaterials();
            }}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'materials'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Material Library ({materials.length})
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs bg-red-600/50 hover:bg-red-600 px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* UPLOADS TAB */}
        {activeTab === 'uploads' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Upload 3D Models</h2>

                {/* Drag & Drop Area */}
                <div
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-700/30 transition mb-6"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mb-4">
                    <span className="text-5xl">📦</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Drop files here or click to select</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Supported: GLB, GLTF, FBX (max 100MB each)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".glb,.gltf,.fbx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Files to Upload</h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-700 p-3 rounded"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Product</label>
                  <input
                    type="text"
                    placeholder="Enter product ID"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={submitFilesForProcessing}
                  disabled={isLoading || uploadedFiles.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span>⬆️</span>
                  {isLoading ? 'Uploading...' : `Upload ${uploadedFiles.length} File${uploadedFiles.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>

            {/* Upload Stats */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-fit">
              <h3 className="text-xl font-bold mb-4">Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Total Uploads</p>
                  <p className="text-3xl font-bold">{uploadedFiles.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Size</p>
                  <p className="text-3xl font-bold">
                    {(uploadedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)}
                    MB
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Processing Jobs</p>
                  <p className="text-3xl font-bold">{processingJobs.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUEUE TAB */}
        {activeTab === 'queue' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Processing Queue</h2>
              <div className="flex gap-2">
                {(['all', 'pending', 'processing', 'completed', 'failed'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        filterStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No jobs in this filter</p>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{job.filename}</h3>
                        <p className="text-sm text-gray-400">Product: {job.product_name}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            job.status === 'completed'
                              ? 'bg-green-500'
                              : job.status === 'failed'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Error message */}
                    {job.error && (
                      <div className="mb-3 bg-red-900/30 border border-red-500/50 rounded p-2">
                        <p className="text-sm text-red-200">{job.error}</p>
                      </div>
                    )}

                    {/* Job details */}
                    {job.result && (
                      <div className="bg-gray-600/30 rounded p-3 mb-3 text-sm">
                        <p>
                          <strong>Vertices:</strong> {job.result.vertexCount.toLocaleString()}
                        </p>
                        <p>
                          <strong>Triangles:</strong> {job.result.triangleCount.toLocaleString()}
                        </p>
                        <p>
                          <strong>Compression:</strong> {job.result.compressionRatio.toFixed(1)}:1
                        </p>
                        <p>
                          <strong>Processing Time:</strong> {job.result.processingTimeMs}ms
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-xs text-gray-400 space-y-1 mb-3">
                      <p>Started: {job.startedAt.toLocaleString()}</p>
                      {job.completedAt && (
                        <p>Completed: {job.completedAt.toLocaleString()}</p>
                      )}
                    </div>

                    {/* Actions */}
                    {job.status === 'completed' && (
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded py-2 text-sm transition"
                      >
                        Delete Model
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Material Form */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Create Material</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Material name"
                    value={newMaterialForm.name}
                    onChange={(e) =>
                      setNewMaterialForm((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Type</label>
                  <select
                    value={newMaterialForm.material_type}
                    onChange={(e) =>
                      setNewMaterialForm((prev) => ({
                        ...prev,
                        material_type: e.target.value
                      }))
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="fabric">Fabric</option>
                    <option value="leather">Leather</option>
                    <option value="metal">Metal</option>
                    <option value="plastic">Plastic</option>
                    <option value="wood">Wood</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Base Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newMaterialForm.base_color_hex}
                      onChange={(e) =>
                        setNewMaterialForm((prev) => ({
                          ...prev,
                          base_color_hex: e.target.value
                        }))
                      }
                      className="flex-1 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newMaterialForm.base_color_hex}
                      onChange={(e) =>
                        setNewMaterialForm((prev) => ({
                          ...prev,
                          base_color_hex: e.target.value
                        }))
                      }
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Roughness</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newMaterialForm.roughness}
                      onChange={(e) =>
                        setNewMaterialForm((prev) => ({
                          ...prev,
                          roughness: parseFloat(e.target.value)
                        }))
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">{newMaterialForm.roughness.toFixed(1)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Metallic</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newMaterialForm.metallic}
                      onChange={(e) =>
                        setNewMaterialForm((prev) => ({
                          ...prev,
                          metallic: parseFloat(e.target.value)
                        }))
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">{newMaterialForm.metallic.toFixed(1)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Price per m²</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMaterialForm.price_per_sq_m}
                    onChange={(e) =>
                      setNewMaterialForm((prev) => ({
                        ...prev,
                        price_per_sq_m: parseFloat(e.target.value)
                      }))
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Sustainability Score
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newMaterialForm.sustainability_score}
                    onChange={(e) =>
                      setNewMaterialForm((prev) => ({
                        ...prev,
                        sustainability_score: parseInt(e.target.value)
                      }))
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {newMaterialForm.sustainability_score}/100
                  </p>
                </div>

                <button
                  onClick={createMaterial}
                  disabled={isLoading || !newMaterialForm.name}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded transition"
                >
                  {isLoading ? 'Creating...' : 'Create Material'}
                </button>
              </div>
            </div>

            {/* Materials List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Material Library</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((material) => (
                  <div key={material.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex gap-4 mb-3">
                      <div
                        className="w-16 h-16 rounded border border-gray-600 flex-shrink-0"
                        style={{ backgroundColor: material.base_color_hex }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{material.name}</h3>
                        <p className="text-sm text-gray-400">{material.material_type}</p>
                      </div>
                    </div>

                    <div className="text-sm space-y-1 mb-4">
                      <p>
                        <strong>Roughness:</strong> {material.roughness.toFixed(2)}
                      </p>
                      <p>
                        <strong>Metallic:</strong> {material.metallic.toFixed(2)}
                      </p>
                      <p>
                        <strong>Price:</strong> ${material.price_per_sq_m.toFixed(2)}/m²
                      </p>
                      <p>
                        <strong>Sustainability:</strong> {material.sustainability_score}/100
                      </p>
                    </div>

                    <button
                      onClick={() => deleteMaterial(material.id)}
                      className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded py-2 text-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin3DAssetManager;
