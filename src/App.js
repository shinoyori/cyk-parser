import React, { useState } from 'react';
import { Play, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import duck from './duck.png';

const CYKParser = () => {
  const [input, setInput] = useState('1+2');
  const [result, setResult] = useState(null);
  const [table, setTable] = useState(null);

  // Gramática simplificada em FNC
  // S -> início
  // E -> expressão
  // T -> termo  
  // F -> fator
  const grammar = {
    // A -> a 
    terminals: [
      { lhs: 'a', rhs: '1' },
      { lhs: 'a', rhs: '2' },
      { lhs: 'a', rhs: '3' },
      { lhs: 'a', rhs: '4' },
      { lhs: 'a', rhs: '5' },
      { lhs: 'a', rhs: '6' },
      { lhs: 'a', rhs: '7' },
      { lhs: 'a', rhs: '8' },
      { lhs: 'a', rhs: '9' },
      { lhs: 'a', rhs: '0' },
      { lhs: 'p', rhs: '+' },
      { lhs: 'm', rhs: '-' },
      { lhs: 't', rhs: '*' },
      { lhs: 'd', rhs: '/' },
      { lhs: 'l', rhs: '(' },
      { lhs: 'r', rhs: ')' }
    ],
    // A -> BC 
    nonTerminals: [
      { lhs: 'S', rhs: ['E', 'A'] },
      { lhs: 'S', rhs: ['T', 'B'] },
      { lhs: 'E', rhs: ['T', 'A'] },
      { lhs: 'E', rhs: ['T', 'C'] },
      { lhs: 'A', rhs: ['p', 'E'] },
      { lhs: 'C', rhs: ['m', 'E'] },
      { lhs: 'T', rhs: ['F', 'B'] },
      { lhs: 'T', rhs: ['F', 'D'] },
      { lhs: 'B', rhs: ['t', 'T'] },
      { lhs: 'D', rhs: ['d', 'T'] },
      { lhs: 'F', rhs: ['l', 'G'] },
      { lhs: 'G', rhs: ['E', 'r'] },
      { lhs: 'G', rhs: ['T', 'r'] }
    ],
    // A -> B
    unitProductions: [
      { lhs: 'S', rhs: 'E' },
      { lhs: 'S', rhs: 'T' },
      { lhs: 'S', rhs: 'F' },
      { lhs: 'E', rhs: 'T' },
      { lhs: 'E', rhs: 'F' },
      { lhs: 'T', rhs: 'F' },
      { lhs: 'F', rhs: 'a' }
    ]
  };

  // Closure de produções unitárias
  const applyUnitClosure = (symbols) => {
    const result = new Set(symbols);
    let changed = true;
    
    while (changed) {
      changed = false;
      const current = Array.from(result);
      
      for (const sym of current) {
        for (const prod of grammar.unitProductions) {
          if (prod.rhs === sym && !result.has(prod.lhs)) {
            result.add(prod.lhs);
            changed = true;
          }
        }
      }
    }
    
    return Array.from(result);
  };

  // Algoritmo CYK
  const cykAlgorithm = (str) => {
    const n = str.length;
    const P = [];
    for (let i = 0; i < n; i++) {
      P[i] = [];
      for (let j = 0; j < n; j++) {
        P[i][j] = [];
      }
    }

    for (let i = 0; i < n; i++) {
      const char = str[i];
      for (const prod of grammar.terminals) {
        if (prod.rhs === char) {
          P[i][i].push(prod.lhs);
        }
      }
      P[i][i] = applyUnitClosure(P[i][i]);
    }

    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        
        for (let k = i; k < j; k++) {
          const leftSymbols = P[i][k];
          const rightSymbols = P[k + 1][j];
          
          for (const prod of grammar.nonTerminals) {
            const [B, C] = prod.rhs;
            
            if (leftSymbols.includes(B) && rightSymbols.includes(C)) {
              if (!P[i][j].includes(prod.lhs)) {
                P[i][j].push(prod.lhs);
              }
            }
          }
        }
        
        P[i][j] = applyUnitClosure(P[i][j]);
      }
    }

    return P;
  };

  const analyzeInput = () => {
    try {
      const cleanInput = input.trim();
      
      if (!cleanInput) {
        setResult({ success: false, message: 'Entrada vazia!' });
        setTable(null);
        return;
      }

      // Valida caracteres
      const validChars = /^[0-9+\-*/()]+$/;
      if (!validChars.test(cleanInput)) {
        setResult({ 
          success: false, 
          message: 'Caracteres inválidos! Use apenas: 0-9, +, -, *, /, (, )' 
        });
        setTable(null);
        return;
      }

      const P = cykAlgorithm(cleanInput);
      const n = cleanInput.length;
      
      // A cadeia é aceita se S está em P[0][n-1]
      const accepted = P[0][n - 1].includes('S');

      setTable(P);
      setResult({
        success: accepted,
        message: accepted 
          ? '✓ ACEITA! A expressão pertence à linguagem.' 
          : '✗ REJEITADA! A expressão NÃO pertence à linguagem.'
      });
    } catch (error) {
      setResult({ 
        success: false, 
        message: `Erro: ${error.message}` 
      });
      setTable(null);
    }
  };

  const examples = [
    '1+2',
    '3*4',
    '1+2*3',
    '(1+2)',
    '(1+2)*3',
    '1+2+3',
    '5/2-1',
    '1++'
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6" style={{
      backgroundImage: `url(${duck})`
    }}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg  p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            
            Algoritmo CYK
          </h1>
          <p className="text-gray-600 mb-6">
            Reconhecimento de Expressões Aritméticas (Forma Normal de Chomsky)
          </p>

          {/* Gramática */}
          <div className="bg-[#D6EDFF] rounded-lg p-4 mb-6">
            <h2 className="font-bold text-indigo-900 mb-3">Gramática (FNC):</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <div className="font-bold text-indigo-800 mb-2">Terminais:</div>
                <div className="text-indigo-700">a → 0|1|2|...|9</div>
                <div className="text-indigo-700">p → +, m → -</div>
                <div className="text-indigo-700">t → *, d → /</div>
                <div className="text-indigo-700">l → (, r → )</div>
              </div>
              <div>
                <div className="font-bold text-indigo-800 mb-2">Não-Terminais:</div>
                <div className="text-indigo-700">S → E | T | F</div>
                <div className="text-indigo-700">E → TA | TC</div>
                <div className="text-indigo-700">T → FB | FD</div>
                <div className="text-indigo-700">F → lG | a</div>
                <div className="text-indigo-700">G → Er | Tr</div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cadeia de Entrada:
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeInput()}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none font-mono text-lg"
                placeholder="Ex: 1+2*3"
              />
              <button
                onClick={analyzeInput}
                className="px-6 py-3 bg-[#FFD255] text-black rounded-lg hover:bg-indigo-700 hover:text-white transition-colors flex items-center gap-2 font-semibold"
              >
                <Play size={20} />
                Analisar
              </button>
            </div>
          </div>

          {/* Exemplos */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Teste estes exemplos:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(ex)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-mono transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Resultado */}
          {result && (
            <div className={`rounded-lg p-4 mb-6 ${
              result.success 
                ? 'bg-green-50 border-2 border-green-500' 
                : 'bg-red-50 border-2 border-red-500'
            }`}>
              <div className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : (
                  <AlertCircle className="text-red-600" size={24} />
                )}
                <span className={`font-semibold text-lg ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </span>
              </div>
            </div>
          )}

          {/* Tabela CYK */}
          {table && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Tabela CYK:</h3>
              <div className="overflow-x-auto bg-gray-50 rounded-lg p-4">
                <div className="mb-3 text-sm text-gray-600">
                  <strong>Cadeia:</strong> <span className="font-mono bg-white px-2 py-1 rounded">{input}</span>
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    {table.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => {
                          if (j < i) {
                            return <td key={j} className="border border-gray-300 p-2 bg-gray-200 w-28"></td>;
                          }
                          
                          const isAcceptCell = i === 0 && j === table.length - 1;
                          const hasS = cell.includes('S');
                          
                          return (
                            <td key={j} className={`border-2 p-3 text-center w-28 ${
                              isAcceptCell && hasS 
                                ? 'bg-green-100 border-green-500' 
                                : isAcceptCell
                                ? 'bg-yellow-50 border-yellow-400'
                                : 'border-gray-300'
                            }`}>
                              <div className="min-h-[50px] flex items-center justify-center">
                                {cell.length > 0 ? (
                                  <div className="text-xs font-mono">
                                    <div className="flex flex-wrap justify-center gap-1">
                                      {cell.map((sym, idx) => (
                                        <span 
                                          key={idx}
                                          className={`px-1 ${
                                            sym === 'S' && isAcceptCell
                                              ? 'font-bold text-green-700 bg-green-200 rounded'
                                              : 'text-gray-700'
                                          }`}
                                        >
                                          {sym}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-lg">∅</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p><strong>Como ler:</strong> Célula [i][j] = não-terminais que derivam a substring da posição i até j</p>
                  <p><strong>Aceita se:</strong> O símbolo <span className="font-mono font-bold">S</span> aparecer na célula superior direita (destacada)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CYKParser;