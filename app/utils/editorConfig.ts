import { cppSnippets, cppLibraries } from './cppSnippets';

export const setupEditor = (editor: any, monaco: any) => {
    if (!editor || !monaco) return;

    // Register the C++ language for Monaco
    monaco.languages.register({ id: 'cpp' });

    // Register completion item provider for C++
    monaco.languages.registerCompletionItemProvider('cpp', {
        provideCompletionItems: (model: any, position: any) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            // Convert snippets to Monaco format
            const suggestions = Object.entries(cppSnippets).map(([label, snippet]) => ({
                label,
                insertText: snippet.body,
                documentation: snippet.description,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
            }));

            // Add library suggestions
            const librarySnippets = cppLibraries.map(lib => ({
                label: `include ${lib}`,
                insertText: `#include ${lib}`,
                documentation: `Include ${lib} library`,
                kind: monaco.languages.CompletionItemKind.Module,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
            }));

            return { suggestions: [...suggestions, ...librarySnippets] };
        },
    });

    // Set language configuration for C++
    monaco.languages.setLanguageConfiguration('cpp', cppLanguageConfig);
};

export const cppLanguageConfig = {
    comments: {
        lineComment: '//',
        blockComment: ['/*', '*/'],
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
    ],
    autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
};

// Helper to provide basic C++ code suggestions
const getCompletionItems = (position: any, model: any) => {
    const word = model.getWordUntilPosition(position);
    const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
    };

    return {
        suggestions: [
            {
                label: 'cout',
                insertText: 'cout << ${1:message} << endl;',
                documentation: 'Print to console',
                range,
            },
            {
                label: 'cin',
                insertText: 'cin >> ${1:variable};',
                documentation: 'Read from console',
                range,
            },
            {
                label: 'for',
                insertText: 'for(int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}',
                documentation: 'For loop',
                range,
            },
            {
                label: 'while',
                insertText: 'while(${1:condition}) {\n\t${2}\n}',
                documentation: 'While loop',
                range,
            },
            {
                label: 'if',
                insertText: 'if(${1:condition}) {\n\t${2}\n}',
                documentation: 'If statement',
                range,
            },
            {
                label: 'class',
                insertText: 'class ${1:ClassName} {\nprivate:\n\t${2}\npublic:\n\t${3}\n};',
                documentation: 'Class definition',
                range,
            },
            {
                label: 'vector',
                insertText: 'vector<${1:int}> ${2:vec};',
                documentation: 'Vector declaration',
                range,
            },
            {
                label: 'stack',
                insertText: 'stack<${1:int}> ${2:st};',
                documentation: 'Stack declaration',
                range,
            },
        ],
    };
};
