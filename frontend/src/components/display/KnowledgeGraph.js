import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';

const KnowledgeGraph = ({ data = [] }) => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [filter, setFilter] = useState('all');

  // Process data into nodes and relationships
  useEffect(() => {
    if (!data || data.length === 0) return;

    const processedNodes = [];
    const processedLinks = [];
    
    // Create nodes from data
    data.forEach((item, index) => {
      const nodeType = item.category || item.type || 'unknown';
      const node = {
        id: index,
        name: item.name || item.title || `Item ${index}`,
        type: nodeType,
        description: item.description || item.summary || '',
        data: item,
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: 20 + (Math.random() * 15)
      };
      processedNodes.push(node);
    });

    // Create links based on relationships
    processedNodes.forEach((node, i) => {
      // Create connections based on shared categories, tags, or other relationships
      processedNodes.forEach((otherNode, j) => {
        if (i !== j) {
          const similarity = calculateSimilarity(node.data, otherNode.data);
          if (similarity > 0.3) { // Threshold for creating connections
            processedLinks.push({
              source: i,
              target: j,
              strength: similarity,
              type: 'similarity'
            });
          }
        }
      });
    });

    setNodes(processedNodes);
    setLinks(processedLinks);
  }, [data]);

  const calculateSimilarity = (item1, item2) => {
    let similarity = 0;
    
    // Category similarity
    if (item1.category === item2.category) similarity += 0.5;
    
    // Tag similarity (if available)
    if (item1.hashtags && item2.hashtags) {
      const tags1 = item1.hashtags.split(',').map(t => t.trim().toLowerCase());
      const tags2 = item2.hashtags.split(',').map(t => t.trim().toLowerCase());
      const commonTags = tags1.filter(tag => tags2.includes(tag));
      similarity += (commonTags.length / Math.max(tags1.length, tags2.length)) * 0.3;
    }
    
    // Material/field similarity
    if (item1.material === item2.material || item1.field === item2.field) {
      similarity += 0.2;
    }
    
    return Math.min(similarity, 1);
  };

  const getNodeColor = (nodeType) => {
    const colorMap = {
      'document': colors.neonTeal,
      'inventory': colors.neonGold,
      'image': colors.neonPurple,
      'audio': colors.neonGreen,
      'beads': '#FF6B6B',
      'stools': '#4ECDC4',
      'bowls': '#45B7D1',
      'fans': '#96CEB4',
      'totebags': '#FFEAA7',
      'home decor': '#DDA0DD',
      'unknown': colors.textMuted
    };
    return colorMap[nodeType.toLowerCase()] || colors.textMuted;
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const filteredNodes = nodes.filter(node => {
    if (filter === 'all') return true;
    return node.type.toLowerCase() === filter.toLowerCase();
  });

  const filteredLinks = links.filter(link => {
    const sourceNode = nodes[link.source];
    const targetNode = nodes[link.target];
    return filteredNodes.includes(sourceNode) && filteredNodes.includes(targetNode);
  });

  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <h3 css={styles.title}>🕸️ Knowledge Graph</h3>
        <div css={styles.controls}>
          <label css={styles.filterLabel}>
            Filter:
            <select 
              css={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="document">Documents</option>
              <option value="inventory">Inventory</option>
              <option value="beads">Beads</option>
              <option value="stools">Stools</option>
              <option value="bowls">Bowls</option>
              <option value="fans">Fans</option>
            </select>
          </label>
        </div>
      </div>

      <div css={styles.graphContainer}>
        {filteredNodes.length === 0 ? (
          <div css={styles.emptyState}>
            <span css={styles.emptyIcon}>🕸️</span>
            <h4>No Graph Data</h4>
            <p>Upload and process some documents or inventory items to see the knowledge graph.</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            css={styles.svg}
            width="100%"
            height="100%"
            viewBox="0 0 800 600"
          >
            {/* Render links */}
            {filteredLinks.map((link, index) => {
              const sourceNode = filteredNodes.find(n => n.id === link.source);
              const targetNode = filteredNodes.find(n => n.id === link.target);
              if (!sourceNode || !targetNode) return null;
              
              return (
                <line
                  key={index}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={colors.border}
                  strokeWidth={link.strength * 3}
                  opacity={0.6}
                />
              );
            })}

            {/* Render nodes */}
            {filteredNodes.map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={getNodeColor(node.type)}
                  stroke={selectedNode?.id === node.id ? colors.neonGold : 'transparent'}
                  strokeWidth={3}
                  css={styles.node}
                  onClick={() => handleNodeClick(node)}
                />
                <text
                  x={node.x}
                  y={node.y + node.size + 15}
                  textAnchor="middle"
                  css={styles.nodeLabel}
                  fill={colors.textLight}
                  fontSize="12"
                >
                  {node.name.length > 15 ? `${node.name.substring(0, 15)}...` : node.name}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>

      {selectedNode && (
        <div css={styles.sidebar}>
          <div css={styles.sidebarHeader}>
            <h4 css={styles.sidebarTitle}>{selectedNode.name}</h4>
            <button 
              css={styles.closeButton}
              onClick={() => setSelectedNode(null)}
            >
              ✕
            </button>
          </div>
          <div css={styles.sidebarContent}>
            <div css={styles.nodeDetail}>
              <label>Type:</label>
              <span css={styles.nodeType} style={{ color: getNodeColor(selectedNode.type) }}>
                {selectedNode.type}
              </span>
            </div>
            {selectedNode.description && (
              <div css={styles.nodeDetail}>
                <label>Description:</label>
                <p>{selectedNode.description}</p>
              </div>
            )}
            <div css={styles.nodeDetail}>
              <label>Connections:</label>
              <span>{filteredLinks.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length}</span>
            </div>
            {selectedNode.data && (
              <div css={styles.rawData}>
                <label>Raw Data:</label>
                <pre css={styles.dataPreview}>
                  {JSON.stringify(selectedNode.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div css={styles.legend}>
        <h5 css={styles.legendTitle}>Legend</h5>
        <div css={styles.legendItems}>
          <div css={styles.legendItem}>
            <div css={styles.legendColor} style={{ backgroundColor: colors.neonTeal }}></div>
            <span>Documents</span>
          </div>
          <div css={styles.legendItem}>
            <div css={styles.legendColor} style={{ backgroundColor: colors.neonGold }}></div>
            <span>Inventory</span>
          </div>
          <div css={styles.legendItem}>
            <div css={styles.legendColor} style={{ backgroundColor: '#FF6B6B' }}></div>
            <span>Beads</span>
          </div>
          <div css={styles.legendItem}>
            <div css={styles.legendColor} style={{ backgroundColor: '#4ECDC4' }}></div>
            <span>Stools</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  `,

  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    border-bottom: 1px solid ${colors.border};
  `,

  title: css`
    color: ${colors.neonTeal};
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  `,

  controls: css`
    display: flex;
    gap: ${layout.spacing.md};
  `,

  filterLabel: css`
    color: ${colors.textLight};
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    font-size: 0.875rem;
  `,

  filterSelect: css`
    ${neoDecorocoBase.input}
    padding: ${layout.spacing.xs} ${layout.spacing.sm};
    font-size: 0.875rem;
  `,

  graphContainer: css`
    flex: 1;
    position: relative;
    overflow: hidden;
  `,

  svg: css`
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  `,

  node: css`
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      filter: brightness(1.2);
    }
  `,

  nodeLabel: css`
    font-family: monospace;
    font-size: 12px;
    pointer-events: none;
  `,

  emptyState: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: ${colors.textLight};
    text-align: center;
    padding: ${layout.spacing.xl};
  `,

  emptyIcon: css`
    font-size: 4rem;
    margin-bottom: ${layout.spacing.lg};
    opacity: 0.5;
  `,

  sidebar: css`
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    background: rgba(26, 26, 26, 0.95);
    border-left: 1px solid ${colors.border};
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
  `,

  sidebarHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    border-bottom: 1px solid ${colors.border};
  `,

  sidebarTitle: css`
    color: ${colors.neonGold};
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  `,

  closeButton: css`
    background: none;
    border: none;
    color: ${colors.textLight};
    font-size: 1.25rem;
    cursor: pointer;
    padding: ${layout.spacing.xs};
    
    &:hover {
      color: ${colors.neonGold};
    }
  `,

  sidebarContent: css`
    padding: ${layout.spacing.lg};
    overflow-y: auto;
    flex: 1;
  `,

  nodeDetail: css`
    margin-bottom: ${layout.spacing.lg};
    
    label {
      display: block;
      color: ${colors.textMuted};
      font-size: 0.875rem;
      margin-bottom: ${layout.spacing.xs};
      font-weight: 600;
    }
    
    span, p {
      color: ${colors.textLight};
      margin: 0;
    }
  `,

  nodeType: css`
    font-weight: 600;
    text-transform: capitalize;
  `,

  rawData: css`
    margin-top: ${layout.spacing.xl};
    
    label {
      display: block;
      color: ${colors.textMuted};
      font-size: 0.875rem;
      margin-bottom: ${layout.spacing.xs};
      font-weight: 600;
    }
  `,

  dataPreview: css`
    background: rgba(0, 0, 0, 0.3);
    padding: ${layout.spacing.md};
    border-radius: 4px;
    font-size: 0.75rem;
    color: ${colors.textLight};
    white-space: pre-wrap;
    overflow-x: auto;
    max-height: 200px;
    overflow-y: auto;
  `,

  legend: css`
    position: absolute;
    bottom: ${layout.spacing.md};
    left: ${layout.spacing.md};
    background: rgba(26, 26, 26, 0.9);
    border: 1px solid ${colors.border};
    border-radius: 8px;
    padding: ${layout.spacing.md};
    backdrop-filter: blur(10px);
  `,

  legendTitle: css`
    color: ${colors.textLight};
    margin: 0 0 ${layout.spacing.sm} 0;
    font-size: 0.875rem;
    font-weight: 600;
  `,

  legendItems: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xs};
  `,

  legendItem: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    color: ${colors.textLight};
    font-size: 0.75rem;
  `,

  legendColor: css`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `
};

export default KnowledgeGraph;
