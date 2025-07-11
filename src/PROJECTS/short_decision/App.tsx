  import React, { useState, useCallback, useEffect } from "react";
  import ReactFlow, {
    MarkerType,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle,
    Position,
    Node,
    Edge,
    Connection,
    NodeProps,
  } from "reactflow";

  import { Plus, Trash2, X, PlayCircle, SkipForward } from "lucide-react";

  import "reactflow/dist/style.css";
  import YouTube from "react-youtube";

  // Interfejsy
  interface VideoNodeData {
    title: string;
    videoUrl: string;
    onDelete: (id: string) => void;
    onPlay: (id: string) => void;
  }

  interface DecisionNodeData {
    question: string;
    onDelete: (id: string) => void;
  }

  interface FlowPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: Node[];
    edges: Edge[];
    startNodeId?: string;
  }

  // Funkcja do wyciągnięcia ID z URL YouTube SHORTS
  const extractYouTubeId = (url: string): string | null => {
    const shortsRegExp = /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const shortsMatch = url.match(shortsRegExp);
    return shortsMatch && shortsMatch[1] ? shortsMatch[1] : null;
  };

  // Komponent Flow Player - modal z odtwarzaczem i obsługą decyzji
  const FlowPlayer: React.FC<FlowPlayerProps> = ({
    isOpen,
    onClose,
    nodes,
    edges,
    startNodeId,
  }) => {
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(
      startNodeId || null
    );
    const [, setPlaying] = useState(false);
    const [showDecision, setShowDecision] = useState(false);

    useEffect(() => {
      if (isOpen && startNodeId) {
        setCurrentNodeId(startNodeId);
        setPlaying(true);
        setShowDecision(false);
      }
    }, [isOpen, startNodeId]);

    const currentNode = nodes.find((n) => n.id === currentNodeId);
    const currentVideoData =
      currentNode?.type === "videoNode"
        ? (currentNode.data as VideoNodeData)
        : null;
    const currentDecisionData =
      currentNode?.type === "decisionNode"
        ? (currentNode.data as DecisionNodeData)
        : null;

    const youtubeId = currentVideoData
      ? extractYouTubeId(currentVideoData.videoUrl)
      : null;

    // Znajdź następne węzły
    const getNextNodes = (nodeId: string) => {
      const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
      return outgoingEdges.map((edge) => {
        const targetNode = nodes.find((n) => n.id === edge.target);
        return {
          edge,
          node: targetNode,
          isYesPath: edge.sourceHandle === "yes",
          isNoPath: edge.sourceHandle === "no",
        };
      });
    };

    const nextNodes = currentNodeId ? getNextNodes(currentNodeId) : [];

    // Funkcja do przejścia do następnego węzła
    const proceedToNext = useCallback(() => {
      setPlaying(false);

      // Jeśli następny węzeł to decyzja, pokaż opcje
      const nextDecisionNode = nextNodes.find(
        (n) => n.node?.type === "decisionNode"
      );
      if (nextDecisionNode) {
        setCurrentNodeId(nextDecisionNode.node!.id);
        setShowDecision(true);
      } else if (nextNodes.length === 1) {
        // Jeśli jest tylko jeden następny węzeł wideo, przejdź do niego
        const nextVideoNode = nextNodes.find((n) => n.node?.type === "videoNode");
        if (nextVideoNode) {
          setCurrentNodeId(nextVideoNode.node!.id);
          setPlaying(true);
        }
      } else if (nextNodes.length > 1) {
        // Jeśli jest kilka opcji, pokaż je
        setShowDecision(true);
      }
    }, [nextNodes]);

    // Obsługa zakończenia filmu - automatyczne przejście do następnego
    const handleVideoEnd = useCallback(() => {
      proceedToNext();
    }, [proceedToNext]);

    // Obsługa wyboru decyzji
    const handleDecisionChoice = (choice: "yes" | "no") => {
      const chosenPath = nextNodes.find((n) =>
        choice === "yes" ? n.isYesPath : n.isNoPath
      );

      if (chosenPath && chosenPath.node) {
        setCurrentNodeId(chosenPath.node.id);
        setShowDecision(false);
        if (chosenPath.node.type === "videoNode") {
          setPlaying(true);
        }
      }
    };

    // Obsługa przejścia do konkretnego węzła
    const goToNode = (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      setCurrentNodeId(nodeId);
      setShowDecision(false);
      setPlaying(node?.type === "videoNode");
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="relative bg-black rounded-lg overflow-hidden max-w-4xl w-full h-full max-h-[90vh] flex">
          {/* Przycisk zamknięcia */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
          >
            <X size={24} />
          </button>

          {/* Główna sekcja z playerem */}
          <div className="flex-1 flex flex-col">
            {/* Nagłówek */}
            <div className="bg-gray-900 p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">🎬 Flow Player</h2>
              {currentNode && (
                <p className="text-gray-300 text-sm mt-1">
                  {currentNode.type === "videoNode" ? "📺" : "❓"}{" "}
                  {currentNode.type === "videoNode"
                    ? (currentNode.data as VideoNodeData).title
                    : (currentNode.data as DecisionNodeData).question}
                </p>
              )}
            </div>

            {/* Player lub sekcja decyzji */}
            <div className="flex-1 flex items-center justify-center p-6">
              {currentNode?.type === "videoNode" && !showDecision ? (
                <>
                  {!youtubeId ? (
                    <div className="w-full h-full flex items-center justify-center text-white text-center">
                      <div>
                        <div className="text-4xl mb-4">❌</div>
                        <div>Nieprawidłowy URL YouTube</div>
                      </div>
                    </div>
                  ) : (
                    <YouTube
                      videoId={youtubeId}
                      opts={{
                        width: "560 ",
                        height: "670  ",
                        playerVars: {
                          autoplay: 1,
                          controls: 0,
                          rel: 0,
                          modestbranding: 1,
                          showinfo: 0,
                          iv_load_policy: 3,
                          disablekb: 1,
                        },
                      }}
                      onEnd={handleVideoEnd}
                    />
                  )}
                </>
              ) : currentNode?.type === "decisionNode" || showDecision ? (
                <div className="bg-gray-800 rounded-lg p-8 max-w-lg w-full">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">❓</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {currentDecisionData
                        ? currentDecisionData.question
                        : "Wybierz opcję"}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {nextNodes.map((nextNode, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (nextNode.isYesPath) handleDecisionChoice("yes");
                          else if (nextNode.isNoPath) handleDecisionChoice("no");
                          else if (nextNode.node) goToNode(nextNode.node.id);
                        }}
                        className={`w-full p-4 rounded-lg text-left transition-colors ${
                          nextNode.isYesPath
                            ? "bg-green-600 hover:bg-green-700"
                            : nextNode.isNoPath
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">
                              {nextNode.isYesPath
                                ? "✅ TAK"
                                : nextNode.isNoPath
                                ? "❌ NIE"
                                : "➡️ DALEJ"}
                            </div>
                            {nextNode.node && (
                              <div className="text-sm text-gray-200 mt-1">
                                {nextNode.node.type === "videoNode"
                                  ? `📺 ${
                                      (nextNode.node.data as VideoNodeData).title
                                    }`
                                  : `❓ ${
                                      (nextNode.node.data as DecisionNodeData)
                                        .question
                                    }`}
                              </div>
                            )}
                          </div>
                          <div className="text-white">
                            {nextNode.node?.type === "videoNode" ? "📺" : "❓"}
                          </div>
                        </div>
                      </button>
                    ))}

                    {nextNodes.length === 0 && (
                      <div className="text-center text-gray-400 py-8">
                        <div className="text-3xl mb-2">🎉</div>
                        <p>Koniec flow!</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">🎬</div>
                  <p>Brak węzła do odtworzenia</p>
                </div>
              )}
            </div>

            {/* Kontrolki */}
            {currentNode?.type === "videoNode" && !showDecision && (
              <div className="bg-gray-900 p-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4"></div>

                  <div className="flex items-center space-x-4">
                    {nextNodes.length > 0 && (
                      <button
                        onClick={proceedToNext}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <SkipForward size={16} />
                        <span>Następny</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar z mapą flow */}
          <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              🗺️ Mapa Flow
            </h3>
            <div className="space-y-2">
              {nodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => goToNode(node.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    node.id === currentNodeId
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="text-lg">
                      {node.type === "videoNode" ? "📺" : "❓"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {node.type === "videoNode"
                          ? (node.data as VideoNodeData).title
                          : (node.data as DecisionNodeData).question}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {node.type === "videoNode" ? "Video" : "Decyzja"}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Komponent węzła wideo - z ratio dla Shorts (9:16)
  const VideoNode: React.FC<NodeProps> = ({ id, data, selected }) => {
    const videoData = data as VideoNodeData;
    const youtubeId = extractYouTubeId(videoData.videoUrl);
    const thumbnailUrl = youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      : null;
    const isValidYouTubeUrl = youtubeId !== null;

    return (
      <div
        className={`bg-black text-white rounded-lg shadow-lg border-2 w-40  ${
          selected ? "border-blue-500" : "border-gray-200"
        }`}
      >
        <Handle type="target" position={Position.Top} />
        <div className="space-y-2">
          <div className="flex items-center justify-between p-1">
            <h4 className="text-xs truncate flex-1 ">
              {videoData.title}
            </h4>
            <button
              onClick={() => videoData.onDelete(id)}
              className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
            >
              <Trash2 size={12} />
            </button>
          </div>

          {/* Miniaturka video w formacie Shorts (9:16) */}
          <div
            className="relative w-full bg-gray-100 rounded overflow-hidden cursor-pointer group"
            style={{ aspectRatio: "9/16" }}
            onClick={() => isValidYouTubeUrl && videoData.onPlay(id)}
          >
            {!isValidYouTubeUrl ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center">
                <div>
                  <div className="text-lg mb-1">📺</div>
                  <div>TYLKO YouTube Shorts!</div>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={thumbnailUrl ?? ""}
                  alt={videoData.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const nextElement = target.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = "flex";
                    }
                  }}
                />
                <div className="w-full h-full items-center justify-center text-gray-500 text-xs text-center hidden">
                  <div>
                    <div className="text-lg mb-1">📺</div>
                    <div>Miniaturka niedostępna</div>
                  </div>
                </div>
                {/* Overlay z przyciskiem play */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle size={24} className="text-white" />
                </div>
              </>
            )}
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  };

  // Komponent węzła decyzyjnego
  const DecisionNode: React.FC<NodeProps> = ({ id, data, selected }) => {
    const decisionData = data as DecisionNodeData;

    return (
      <div
        className={`bg-yellow-50 rounded-lg shadow-lg border-2 p-3 w-40 ${
          selected ? "border-yellow-500" : "border-yellow-200"
        }`}
      >
        <Handle type="target" position={Position.Top} />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs flex-1">
              {decisionData.question}
            </h3>
            <button
              onClick={() => decisionData.onDelete(id)}
              className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <div className="bg-yellow-100 p-2 rounded">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-1"></div>
                <span className="text-xs font-medium">TAK</span>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-1"></div>
                <span className="text-xs font-medium">NIE</span>
              </div>
            </div>
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          id="yes"
          style={{ left: "30%" }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="no"
          style={{ left: "70%" }}
        />
      </div>
    );
  };

  const nodeTypes = {
    videoNode: VideoNode,
    decisionNode: DecisionNode,
  };

  // Przykładowe YouTube Shorts URL-e
  const sampleYouTubeShortsUrls = [
    "https://www.youtube.com/shorts/a2BcItiz3Uw",
    "https://www.youtube.com/shorts/gxOCPUOab7M",
    "https://www.youtube.com/shorts/jNQXAC9IVRw",
    "https://www.youtube.com/shorts/9bZkp7q19f0",
    "https://www.youtube.com/shorts/L_jWHffIx5E",
    "https://www.youtube.com/shorts/astISOttCQ0",
  ];

  // Główna aplikacja
  export default function DecisionTreeApp() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
    const [selectedNodeType, setSelectedNodeType] = useState<
      "videoNode" | "decisionNode"
    >("videoNode");
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [flowPlayerOpen, setFlowPlayerOpen] = useState(false);
    const [flowStartNodeId, setFlowStartNodeId] = useState<string | null>(null);

    const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges]
    );

    const onPlayVideo = useCallback((nodeId: string) => {
      setFlowStartNodeId(nodeId);
      setFlowPlayerOpen(true);
    }, []);

    const startFlow = useCallback(
      (nodeId?: string) => {
        const startNode = nodeId ? nodes.find((n) => n.id === nodeId) : nodes[0];
        if (startNode) {
          setFlowStartNodeId(startNode.id);
          setFlowPlayerOpen(true);
        }
      },
      [nodes]
    );

    const onNodeDelete = useCallback(
      (nodeId: string) => {
        setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
        setEdges((edges) =>
          edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
        );
      },
      [setNodes, setEdges]
    );

    const addNode = () => {
      const newNodeId = `node-${Date.now()}`;
      const defaultVideoUrl =
        sampleYouTubeShortsUrls[
          Math.floor(Math.random() * sampleYouTubeShortsUrls.length)
        ];

      const newNode: Node = {
        id: newNodeId,
        type: selectedNodeType,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data:
          selectedNodeType === "videoNode"
            ? {
                title: newTitle || "Nowy Shorts",
                videoUrl: newVideoUrl || defaultVideoUrl,
                onDelete: onNodeDelete,
                onPlay: onPlayVideo,
              }
            : {
                question: newTitle || "Nowe pytanie?",
                onDelete: onNodeDelete,
              },
      };

      setNodes((nodes) => [...nodes, newNode]);
      setNewVideoUrl("");
      setNewTitle("");
    };

    const validateYouTubeUrl = (url: string) => {
      return extractYouTubeId(url) !== null;
    };

    const createSampleFlow = () => {
      const sampleNodes: Node[] = [
        {
          id: "start",
          type: "videoNode",
          position: { x: 300, y: 0 },
          data: {
            title: "Intro - Rozpocznij tutaj",
            videoUrl: "https://www.youtube.com/shorts/RPqlEB6nvD8",
            onDelete: onNodeDelete,
            onPlay: onPlayVideo,
          },
        },
        {
          id: "decision1",
          type: "decisionNode",
          position: { x: 300, y: 340 },
          data: {
            question: "Czy chcesz kontynuować?",
            onDelete: onNodeDelete,
          },
        },
        {
          id: "video-yes",
          type: "videoNode",
          position: { x: 150, y: 560 },
          data: {
            title: "Tak - Kolejny Shorts",
            videoUrl: "https://www.youtube.com/shorts/gxOCPUOab7M",
            onDelete: onNodeDelete,
            onPlay: onPlayVideo,
          },
        },
        {
          id: "video-no",
          type: "videoNode",
          position: { x: 450, y: 560 },
          data: {
            title: "Nie - Zakończenie",
            videoUrl: "https://www.youtube.com/shorts/2pQrVF3TnW0",
            onDelete: onNodeDelete,
            onPlay: onPlayVideo,
          },
        },
      ];
    
      const sampleEdges: Edge[] = [
        { id: "e1", source: "start", target: "decision1" },
        {
          id: "e2",
          source: "decision1",
          sourceHandle: "yes",
          target: "video-yes",
        },
        {
          id: "e3",
          source: "decision1",
          sourceHandle: "no",
          target: "video-no",
        },
      ];
    
      setNodes(sampleNodes);
      setEdges(sampleEdges);
    };
    
    
    

    return (
      <div className="w-full h-screen bg-gray-50">
        {/* Flow Player Modal */}
        <FlowPlayer
          isOpen={flowPlayerOpen}
          onClose={() => setFlowPlayerOpen(false)}
          nodes={nodes}
          edges={edges}
          startNodeId={flowStartNodeId || undefined}
        />

        <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg w-80">
          <h2 className="text-lg font-bold mb-4">🎬 Decision Tree Shorts</h2>
          <div className="space-y-3">
            <button
              onClick={createSampleFlow}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            >
              ✨ Stwórz przykładowy flow
            </button>

            <button
              onClick={() => startFlow()}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:bg-gray-400"
              disabled={nodes.length === 0}
            >
              🎮 Uruchom Flow Player
            </button>

            <div className="border-t pt-3">
              <select
                value={selectedNodeType}
                onChange={(e) =>
                  setSelectedNodeType(
                    e.target.value as "videoNode" | "decisionNode"
                  )
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="videoNode">📺 Węzeł Shorts</option>
                <option value="decisionNode">❓ Węzeł decyzyjny</option>
              </select>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mt-2"
                placeholder={
                  selectedNodeType === "videoNode" ? "Tytuł Shorts" : "Pytanie"
                }
              />

              {selectedNodeType === "videoNode" && (
                <>
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md mt-2 ${
                      newVideoUrl && !validateYouTubeUrl(newVideoUrl)
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="https://www.youtube.com/shorts/..."
                  />
                  {newVideoUrl && !validateYouTubeUrl(newVideoUrl) && (
                    <div className="text-red-500 text-xs mt-1">
                      ❌ Nieprawidłowy link - tylko YouTube Shorts!
                    </div>
                  )}
                </>
              )}

              <button
                onClick={addNode}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2 mt-2"
              >
                <Plus size={16} />
                <span>Dodaj węzeł</span>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
            panOnScroll={true}
            selectionOnDrag={true}
            panOnDrag={[1, 2]}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            snapToGrid={true}
            snapGrid={[20, 20]}
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.Arrow,

                width: 25,
                height: 25,
              },
            }}
          >
            
          </ReactFlow>
        </div>
      </div>
    );
  }
