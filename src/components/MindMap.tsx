import { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapProps {
  lectureId: string;
  title?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Main Topic' },
    position: { x: 250, y: 25 },
  },
];

export default function MindMap({ 
  lectureId, 
  title = 'New Mind Map',
  initialNodes = defaultNodes,
  initialEdges = []
}: MindMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeName, setNodeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    if (!nodeName) return;

    const newNode: Node = {
      id: String(nodes.length + 1),
      data: { label: nodeName },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeName('');
  }, [nodeName, nodes.length, setNodes]);

  const onSave = async () => {
    if (!lectureId) {
      setError('Please select a lecture first');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/mindmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title,
          nodes, 
          edges,
          lectureId 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save mind map');
      }

      // Clear error if save was successful
      setError(null);
    } catch (error) {
      console.error('Failed to save mind map:', error);
      setError(error instanceof Error ? error.message : 'Failed to save mind map');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-[600px] bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex-1 flex items-center space-x-4">
          <input
            type="text"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            placeholder="Enter node text..."
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={addNode}
            disabled={!nodeName}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Add Node
          </button>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Map'}
        </button>
      </div>
      
      {error && (
        <div className="px-4 py-2 bg-red-100 border-b border-red-200 text-red-700">
          {error}
        </div>
      )}

      <div className="h-[calc(100%-80px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
