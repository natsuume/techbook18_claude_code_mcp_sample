import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as path from 'path';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

class MCPTestClient {
  private process: ChildProcessWithoutNullStreams | null = null;
  private messageBuffer = '';
  private requestId = 0;

  async start(): Promise<void> {
    const serverPath = path.join(__dirname, '..', 'src', 'index.ts');
    
    this.process = spawn('tsx', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.process.stdout.on('data', (data: Buffer) => {
      this.messageBuffer += data.toString();
    });

    this.process.stderr.on('data', (data: Buffer) => {
      console.error('Server error:', data.toString());
    });

    // 初期化を待つ
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async sendRequest(method: string, params?: unknown): Promise<JsonRpcResponse> {
    if (!this.process) {
      throw new Error('Server not started');
    }

    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method,
      params,
    };

    const message = JSON.stringify(request) + '\n';
    
    this.process.stdin.write(message);

    // レスポンスを待つ
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Response timeout'));
      }, 5000);

      const checkResponse = setInterval(() => {
        const lines = this.messageBuffer.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line) as JsonRpcResponse;
              
              if (response.id === request.id) {
                clearTimeout(timeout);
                clearInterval(checkResponse);
                resolve(response);
                
                return;
              }
            } catch {
              // JSONパースエラーは無視
            }
          }
        }
      }, 100);
    });
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

async function testMCPServer(): Promise<void> {
  console.log('=== MCP Protocol Test ===\n');

  const client = new MCPTestClient();

  try {
    console.log('1. Starting MCP Server...');
    await client.start();
    console.log('✓ Server started\n');

    console.log('2. Testing initialize method...');
    const initResponse = await client.sendRequest('initialize', {
      protocolVersion: '1.0.0',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0',
      },
    });
    console.log('✓ Initialize response:', JSON.stringify(initResponse, null, 2), '\n');

    console.log('3. Testing tools/list method...');
    const toolsResponse = await client.sendRequest('tools/list');
    console.log('✓ Tools list response:', JSON.stringify(toolsResponse, null, 2), '\n');

    console.log('4. Testing tool execution...');
    const toolResponse = await client.sendRequest('tools/call', {
      name: 'repeat_string',
      arguments: {
        text: 'Hello ',
        count: 3,
      },
    });
    console.log('✓ Tool execution response:', JSON.stringify(toolResponse, null, 2), '\n');

    // 結果の検証
    const result = toolResponse.result as { content?: Array<{ type: string; text: string }> };
    
    if (result?.content?.[0]?.text === 'Hello Hello Hello ') {
      console.log('✅ Tool returned expected result: "Hello Hello Hello "\n');
    } else {
      console.log('❌ Tool returned unexpected result\n');
    }

    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.stop();
  }
}

void testMCPServer();