'use client';

import { useRef, useState, useEffect, MouseEvent as ReactMouseEvent, WheelEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../../component/Header';
import TriggerPanel from './panel/TriggerPanel';
import AppEventPanel from './panel/AppEventPanel';
import TelegramPanel from './panel/TelegramPanel';
import NodePanel from './panel/NodePanel';
import TelegramCredentialModal from './triggerNode/TelegramCredentialModal';
import TelegramNodeConfig from '../../../component/TelegramNodeConfig';
import StartButton from './triggerNode/StartNode';
import { saveWorkflow, getWorkflow, createNewWorkflow, WorkflowData } from '@/lib/workflowStorage';

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface Node {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  data: {
    botToken?: string;
    botInfo?: any;
    triggerType?: string;
    icon?: string;
    color?: string;
  };
}

export default function FlowPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const workflowId = searchParams.get('id');
  
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState<string>('My workflow');
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isTriggerPanelOpen, setIsTriggerPanelOpen] = useState(false);
  const [isAppEventPanelOpen, setIsAppEventPanelOpen] = useState(false);
  const [isTelegramPanelOpen, setIsTelegramPanelOpen] = useState(false);
  const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedTelegramAction, setSelectedTelegramAction] = useState<string>('');
  const [botToken, setBotToken] = useState<string>('');
  const [botInfo, setBotInfo] = useState<any>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Handle node drag start
  const handleNodeMouseDown = (e: ReactMouseEvent<HTMLDivElement>, nodeId: string) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        // Calculate offset from mouse to node position, accounting for transform
        const mouseX = (e.clientX - canvasRect.left - transform.x) / transform.scale;
        const mouseY = (e.clientY - canvasRect.top - transform.y) / transform.scale;
        setDragOffset({
          x: mouseX - node.position.x,
          y: mouseY - node.position.y,
        });
      }
    }
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    // Only pan with middle mouse button or space + left click
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      e.preventDefault();
    }
  };

  // Handle mouse move for panning and dragging
  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      }));
    } else if (draggedNode) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        // Calculate new position accounting for transform and scale
        const mouseX = (e.clientX - canvasRect.left - transform.x) / transform.scale;
        const mouseY = (e.clientY - canvasRect.top - transform.y) / transform.scale;
        
        setNodes(prev => prev.map(node => 
          node.id === draggedNode
            ? {
                ...node,
                position: {
                  x: mouseX - dragOffset.x,
                  y: mouseY - dragOffset.y,
                },
              }
            : node
        ));
      }
    }
  };

  // Handle mouse up to stop panning and dragging
  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNode(null);
  };

  // Handle zoom with mouse wheel
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, transform.scale + delta), 3);
    
    // Get mouse position relative to canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate new position to zoom towards mouse
    const scaleRatio = newScale / transform.scale;
    const newX = mouseX - (mouseX - transform.x) * scaleRatio;
    const newY = mouseY - (mouseY - transform.y) * scaleRatio;
    
    setTransform({
      x: newX,
      y: newY,
      scale: newScale,
    });
  };

  // Reset view
  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Add node to canvas
  const handleAddNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'telegram-trigger',
      name: 'Telegram Trigger',
      position: {
        x: 400 + (nodes.length * 50),
        y: 300 + (nodes.length * 50),
      },
      data: {
        botToken: botToken,
        botInfo: botInfo,
        triggerType: selectedTelegramAction,
        icon: 'telegram',
        color: '#0088cc',
      },
    };

    setNodes((prev) => [...prev, newNode]);
    setIsNodeConfigOpen(false);
    
    // Show success toast
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    
    // Log success
    console.log('Node added to canvas:', newNode);
  };

  // Load workflow on mount
  useEffect(() => {
    if (workflowId) {
      // Load existing workflow
      const workflow = getWorkflow(workflowId);
      if (workflow) {
        setCurrentWorkflow(workflow);
        setWorkflowTitle(workflow.title);
        setNodes(workflow.nodes || []);
        setTransform(workflow.transform || { x: 0, y: 0, scale: 1 });
        console.log('Loaded workflow:', workflow.title);
      }
    } else {
      // Create new workflow
      const newWorkflow = createNewWorkflow();
      setCurrentWorkflow(newWorkflow);
      setWorkflowTitle(newWorkflow.title);
      // Update URL with new workflow ID
      router.replace(`/flow?id=${newWorkflow.id}`);
    }
  }, []); // Run only once on mount

  // Auto-save workflow (every 3 seconds when there are changes)
  useEffect(() => {
    if (!currentWorkflow) return;

    const autoSaveInterval = setInterval(() => {
      const workflowData: WorkflowData = {
        ...currentWorkflow,
        title: workflowTitle,
        nodes,
        transform,
      };
      
      saveWorkflow(workflowData);
      setLastSaveTime(new Date());
    }, 3000); // Auto-save every 3 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentWorkflow, nodes, transform, workflowTitle]);

  // Save on unmount (when leaving the page)
  useEffect(() => {
    return () => {
      if (currentWorkflow) {
        const workflowData: WorkflowData = {
          ...currentWorkflow,
          title: workflowTitle,
          nodes,
          transform,
        };
        saveWorkflow(workflowData);
      }
    };
  }, [currentWorkflow, nodes, transform, workflowTitle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Reset view with 'R' key
      if (e.key === 'r' || e.key === 'R') {
        resetView();
      }
      // Zoom in with '+'
      if (e.key === '+' || e.key === '=') {
        setTransform(prev => ({
          ...prev,
          scale: Math.min(prev.scale + 0.1, 3),
        }));
      }
      // Zoom out with '-'
      if (e.key === '-' || e.key === '_') {
        setTransform(prev => ({
          ...prev,
          scale: Math.max(prev.scale - 0.1, 0.1),
        }));
      }
      // Manual save with Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentWorkflow) {
          const workflowData: WorkflowData = {
            ...currentWorkflow,
            title: workflowTitle,
            nodes,
            transform,
          };
          saveWorkflow(workflowData);
          setLastSaveTime(new Date());
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWorkflow, nodes, transform, workflowTitle]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header title="LinkedOut Flow" showBackButton={true} />

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Grid Background */}
        <div
          ref={canvasRef}
          className="absolute inset-0"
          style={{
            background: '#1a1a1f',
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px`,
            backgroundPosition: `${transform.x}px ${transform.y}px`,
            cursor: draggedNode ? 'grabbing' : isPanning ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Canvas Content - Transform wrapper */}
          <div
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            {/* Render Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className="absolute hover:shadow-2xl"
                style={{
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`,
                  transform: 'translate(-50%, -50%)',
                  transition: draggedNode === node.id ? 'none' : 'all 0.2s',
                  pointerEvents: draggedNode && draggedNode !== node.id ? 'none' : 'auto',
                }}
              >
                {/* Main Node Card */}
                <div className="flex flex-col items-center">
                  {/* Node Card */}
                  <div
                    className="relative p-4 shadow-lg transition-all hover:shadow-xl"
                    style={{
                      background: 'white',
                      border: '3px solid #9ca3af',
                      width: '160px',
                      height: '160px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '32px',
                      cursor: draggedNode === node.id ? 'grabbing' : 'grab',
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  >
                    {/* Lightning Bolt Icon - Top Left */}
                    <div
                      className="absolute"
                      style={{
                        top: '12px',
                        left: '12px',
                      }}
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="#ef4444" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                      </svg>
                    </div>

                    {/* Delete Button - Top Right */}
                    <button
                      className="absolute opacity-0 hover:opacity-100 transition-opacity rounded-full p-1 hover:bg-red-50"
                      style={{
                        top: '8px',
                        right: '8px',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setNodes((prev) => prev.filter((n) => n.id !== node.id));
                      }}
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="#ef4444" 
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Telegram Icon - Center */}
                    <div
                      className="w-28 h-28 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #54a9eb, #41a4e6)',
                      }}
                    >
                      <svg className="w-16 h-16" fill="white" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                      </svg>
                    </div>

                    {/* Connection Point - Right Side */}
                    
                    <div
                      className="absolute flex items-center"
                      style={{
                        right: '-100px', //adjust connection line
                        top: '50%', 
                        transform: 'translateY(-50%)',
                      }}
                    >
                      {/* Gray Circle */}
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{
                          background: '#6b7280',
                          border: '3px solid white',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                      
                      {/* Connecting Line */}
                      <div
                        style={{
                          width: '60px',
                          height: '3px',
                          background: '#9ca3af',
                        }}
                      />

                      {/* Plus Button */}
                      <button
                        className="flex items-center justify-center rounded-lg transition-all hover:bg-gray-200"
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'white',
                          border: '2px solid #9ca3af',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNodePanelOpen(true);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="#6b7280" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Text Below Card */}
                  <div className="mt-4 text-center">
                    <h3
                      className="font-semibold mb-1"
                      style={{
                        color: '#4b5563',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '16px',
                      }}
                    >
                      Telegram Trigger
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: '#9ca3af',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Updates: {node.data.triggerType?.replace(/-/g, ' ') || 'message'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Start Button - Only show if no nodes */}
            {nodes.length === 0 && (
              <StartButton 
                transform={transform} 
                onClick={() => setIsTriggerPanelOpen(true)} 
              />
            )}
          </div>
        </div>

        {/* Controls Overlay */}
        <div
          className="absolute top-4 right-4 flex flex-col gap-2"
          style={{ zIndex: 10 }}
        >
          {/* Zoom Controls */}
          <div
            className="flex flex-col gap-1 p-2 rounded-lg"
            style={{
              background: 'rgba(20, 20, 25, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <button
              onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, 3) }))}
              className="px-3 py-2 rounded transition-all hover:scale-105"
              style={{
                background: 'rgba(60, 60, 70, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#e0e8f0',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              +
            </button>
            <div
              className="text-center py-1"
              style={{
                color: '#e0e8f0',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
            >
              {Math.round(transform.scale * 100)}%
            </div>
            <button
              onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.1) }))}
              className="px-3 py-2 rounded transition-all hover:scale-105"
              style={{
                background: 'rgba(60, 60, 70, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#e0e8f0',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              −
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetView}
            className="px-3 py-2 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(20, 20, 25, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e0e8f0',
              fontSize: '12px',
              fontFamily: "'Inter', sans-serif",
              backdropFilter: 'blur(10px)',
            }}
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Reset
          </button>
        </div>

        {/* Info Overlay */}
        <div
          className="absolute bottom-4 left-4 px-4 py-2 rounded-lg flex items-center gap-4"
          style={{
            background: 'rgba(20, 20, 25, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#9fb5cc',
            fontSize: '12px',
            fontFamily: "'Inter', sans-serif",
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: '#10b981',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            <span>Auto-save active</span>
          </div>
          <span>|</span>
          <span>Position: {Math.round(transform.x)}, {Math.round(transform.y)}</span>
          <span>|</span>
          <span>Zoom: {Math.round(transform.scale * 100)}%</span>
          <span>|</span>
          <span>Nodes: {nodes.length}</span>
        </div>

        {/* Workflow Title */}
        <div
          className="absolute top-4 left-4 px-4 py-2 rounded-lg"
          style={{
            background: 'rgba(20, 20, 25, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            zIndex: 10,
          }}
        >
          <input
            type="text"
            value={workflowTitle}
            onChange={(e) => setWorkflowTitle(e.target.value)}
            className="bg-transparent outline-none text-lg font-semibold"
            style={{
              color: '#e0e8f0',
              fontFamily: "'Inter', sans-serif",
              minWidth: '200px',
            }}
            placeholder="Workflow name..."
          />
        </div>

        {/* Add Node FAB - Show if nodes exist */}
        {nodes.length > 0 && (
          <button
            onClick={() => setIsTriggerPanelOpen(true)}
            className="absolute bottom-4 right-4 p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              zIndex: 10,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div
            className="absolute top-20 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              zIndex: 50,
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Node added to canvas successfully!
          </div>
        )}
      </div>

      {/* Fonts */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
      `}</style>

      {/* Trigger Panel */}
      <TriggerPanel
        isOpen={isTriggerPanelOpen}
        onClose={() => setIsTriggerPanelOpen(false)}
        onSelectTrigger={(trigger) => {
          setSelectedTrigger(trigger);
          console.log('Selected trigger:', trigger);
          
          // If "app-event" is selected, open the AppEventPanel
          if (trigger === 'app-event') {
            setIsTriggerPanelOpen(false);
            setIsAppEventPanelOpen(true);
          }
        }}
      />

      {/* App Event Panel */}
      <AppEventPanel
        isOpen={isAppEventPanelOpen}
        onClose={() => setIsAppEventPanelOpen(false)}
        onBack={() => {
          setIsAppEventPanelOpen(false);
          setIsTriggerPanelOpen(true);
        }}
        onSelectApp={(appId) => {
          console.log('Selected app:', appId);
          
          // If "telegram" is selected, open the TelegramPanel
          if (appId === 'telegram') {
            setIsAppEventPanelOpen(false);
            setIsTelegramPanelOpen(true);
          }
        }}
      />

      {/* Telegram Panel */}
      <TelegramPanel
        isOpen={isTelegramPanelOpen}
        onClose={() => setIsTelegramPanelOpen(false)}
        onBack={() => {
          setIsTelegramPanelOpen(false);
          setIsAppEventPanelOpen(true);
        }}
        onSelectAction={(actionId) => {
          console.log('Selected Telegram action:', actionId);
          setSelectedTelegramAction(actionId);
          setIsTelegramPanelOpen(false);
          setIsCredentialModalOpen(true);
        }}
      />

      {/* Telegram Credential Modal */}
      <TelegramCredentialModal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        onSubmit={(token: string, info: any) => {
          console.log('Bot token submitted:', token);
          console.log('Bot info:', info);
          setBotToken(token);
          setBotInfo(info);
          setIsCredentialModalOpen(false);
          setIsNodeConfigOpen(true);
        }}
      />

      {/* Telegram Node Configuration */}
      <TelegramNodeConfig
        isOpen={isNodeConfigOpen}
        onClose={() => {
          setIsNodeConfigOpen(false);
          setBotToken('');
          setBotInfo(null);
          setSelectedTelegramAction('');
        }}
        onAddNode={handleAddNode}
        triggerType={selectedTelegramAction}
        botToken={botToken}
        botInfo={botInfo}
      />

      {/* Node Panel */}
      <NodePanel
        isOpen={isNodePanelOpen}
        onClose={() => setIsNodePanelOpen(false)}
        onAddNode={(nodeType) => {
          console.log('Adding node from NodePanel:', nodeType);
          
          // Create a new node based on the selected node type
          const newNode: Node = {
            id: `node-${Date.now()}`,
            type: nodeType.id,
            name: nodeType.title,
            position: {
              x: 400 + (nodes.length * 50),
              y: 300 + (nodes.length * 50),
            },
            data: {
              icon: nodeType.icon,
              color: '#10b981',
            },
          };

          setNodes((prev) => [...prev, newNode]);
          setIsNodePanelOpen(false);
          
          // Show success toast
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
        }}
      />
    </div>
  );
}

