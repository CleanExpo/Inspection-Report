interface Node {
  id: string;
  url: string;
  status: 'active' | 'inactive';
  metrics: {
    responseTime: number;
    connections: number;
  };
}

interface LoadBalancerStatus {
  activeNodes: number;
  totalNodes: number;
  strategy: string;
  nodeStatus: Node[];
}

type RoutingStrategy = 'round-robin' | 'least-connections' | 'response-time';

class LoadBalancer {
  private nodes: Map<string, Node> = new Map();
  private currentStrategy: RoutingStrategy = 'round-robin';
  private currentNodeIndex: number = 0;

  registerNode(id: string, url: string): void {
    this.nodes.set(id, {
      id,
      url,
      status: 'active',
      metrics: {
        responseTime: 0,
        connections: 0
      }
    });
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
  }

  updateNodeMetrics(id: string, metrics: { responseTime: number; connections: number }): void {
    const node = this.nodes.get(id);
    if (node) {
      node.metrics = metrics;
      this.nodes.set(id, node);
    }
  }

  getNextNode(path: string): Node | null {
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.status === 'active');
    if (activeNodes.length === 0) return null;

    switch (this.currentStrategy) {
      case 'round-robin':
        return this.getRoundRobinNode(activeNodes);
      case 'least-connections':
        return this.getLeastConnectionsNode(activeNodes);
      case 'response-time':
        return this.getFastestNode(activeNodes);
      default:
        return activeNodes[0];
    }
  }

  updateStrategy(profile: string): void {
    switch (profile) {
      case 'conservative':
        this.currentStrategy = 'round-robin';
        break;
      case 'balanced':
        this.currentStrategy = 'least-connections';
        break;
      case 'aggressive':
        this.currentStrategy = 'response-time';
        break;
    }
  }

  getStatus(): LoadBalancerStatus {
    const nodeStatus = Array.from(this.nodes.values());
    return {
      activeNodes: nodeStatus.filter(n => n.status === 'active').length,
      totalNodes: nodeStatus.length,
      strategy: this.currentStrategy,
      nodeStatus
    };
  }

  stop(): void {
    this.nodes.clear();
  }

  private getRoundRobinNode(nodes: Node[]): Node {
    this.currentNodeIndex = (this.currentNodeIndex + 1) % nodes.length;
    return nodes[this.currentNodeIndex];
  }

  private getLeastConnectionsNode(nodes: Node[]): Node {
    return nodes.reduce((min, node) => 
      node.metrics.connections < min.metrics.connections ? node : min
    , nodes[0]);
  }

  private getFastestNode(nodes: Node[]): Node {
    return nodes.reduce((fastest, node) =>
      node.metrics.responseTime < fastest.metrics.responseTime ? node : fastest
    , nodes[0]);
  }
}

export const loadBalancer = new LoadBalancer();
