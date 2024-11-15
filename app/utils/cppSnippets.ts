export const cppSnippets = {
    'cout': {
        prefix: 'cout',
        body: 'cout << ${1:message} << endl;',
        description: 'Print to console'
    },
    'cin': {
        prefix: 'cin',
        body: 'cin >> ${1:variable};',
        description: 'Read from console'
    },
    'for': {
        prefix: 'for',
        body: 'for(int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}',
        description: 'For loop'
    },
    'while': {
        prefix: 'while',
        body: 'while(${1:condition}) {\n\t${2}\n}',
        description: 'While loop'
    },
    'class': {
        prefix: 'class',
        body: 'class ${1:ClassName} {\nprivate:\n\t${2}\npublic:\n\t${3}\n};',
        description: 'Class definition'
    },
    'vector': {
        prefix: 'vector',
        body: 'vector<${1:int}> ${2:vec};',
        description: 'Vector declaration'
    },
    'stack': {
        prefix: 'stack',
        body: 'stack<${1:int}> ${2:st};',
        description: 'Stack declaration'
    }
};

export const cppLibraries = [
    '<iostream>',
    '<vector>',
    '<string>',
    '<stack>',
    '<queue>',
    '<map>',
    '<set>',
    '<algorithm>',
    '<cmath>',
    '<fstream>'
];

export const commonHeaders = cppLibraries.map(lib => `#include ${lib}`).join('\n');
