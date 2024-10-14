import * as fs from 'fs';
import * as path from 'path';


function loadVectors(filePath: string): { [key: string]: number[] } {
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.trim().split('\n');
  const vectors: { [key: string]: number[] } = {};

  lines.forEach(line => {
    const [word, ...vector] = line.split(' ');
    vectors[word] = vector.map(Number);
  });

  return vectors;
}

function getWordVector(word: string, vectors: { [key: string]: number[] }): number[] | null {
  return vectors[word] || null;
}

function getSentenceVector(sentence: string, vectors: { [key: string]: number[] }): number[] {
    const words = sentence.split(' ');
    const sentenceVector: number[] = [];
    let wordCount = 0;
  
    words.forEach(word => {
      const vector = getWordVector(word, vectors);
      if (vector) {
        if (sentenceVector.length === 0) {
          vector.forEach(val => sentenceVector.push(val));
        } else {
          vector.forEach((val, index) => {
            sentenceVector[index] += val;
          });
        }
        wordCount++;
      }
    });
  
    return sentenceVector.map(val => val / wordCount);
}

function dotProduct(vecA: number[], vecB: number[]): number {
  return vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
}

function magnitude(vec: number[]): number {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  console.log(dotProduct(vecA, vecB))
  console.log(magnitude(vecA) * magnitude(vecB))
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}


const filePath = path.resolve(__dirname, 'glove.6B.100d.txt');
const vectors = loadVectors(filePath);

const word = 'paris';
const word2 = 'france';
const word3 = 'china'
const word4 = 'beijing'
const sentence = 'Hello world and its global inhabitants'
const vector1 = getWordVector(word, vectors);
const vector2 = getWordVector(word2, vectors)
const vector3 = getWordVector(word3, vectors)
const vector4 = getWordVector(word4, vectors)


if (vector1 && vector2 && vector3 && vector4) {
  const subtractedVector = vector1.map((value, index) => value - vector2[index]);
  const addedVector = subtractedVector.map((value, index) => value + vector3[index]);
  console.log(`Vector for "${word}":`, vector1);
  console.log(`Vector for vector1 - vector2 + vector3 is:`, addedVector)
  console.log("Vector 4 is this:", vector4)
  console.log("Cosine similarity is this:", cosineSimilarity(addedVector, vector4))
} else {
  console.log(`Word "${word}" not found.`);
}

// import * as fs from 'fs';
// import * as path from 'path';

// // Load the vectors from a text file
// function loadVectors(filePath: string): { [key: string]: number[] } {
//   const data = fs.readFileSync(filePath, 'utf8');
//   const lines = data.trim().split('\n');
//   const vectors: { [key: string]: number[] } = {};

//   lines.forEach(line => {
//     const [word, ...vector] = line.split(' ');
//     vectors[word] = vector.map(Number);
//   });

//   return vectors;
// }

// function getWordVector(word: string, vectors: { [key: string]: number[] }): number[] | null {
//   return vectors[word] || null;
// }

// function dotProduct(vecA: number[], vecB: number[]): number {
//   return vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
// }

// function magnitude(vec: number[]): number {
//   return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
// }

// function cosineSimilarity(vecA: number[], vecB: number[]): number {
//   console.log(dotProduct(vecA, vecB))
//   console.log(magnitude(vecA) * magnitude(vecB))
//   return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
// }

// function euclidean(vecA: number[], vecB: number[]): number {
//     const subtracted = vecA.map((i, n) => i - vecB[n]);
//     const powered = subtracted.map(e => Math.pow(e, 2));
//     const sum = powered.reduce((total, current) => total + current, 0)
//     return Math.sqrt(sum);
// }

// function manhattan(vecA: number[], vecB: number[]): number {
//     let distance = 0
//     for (let i = 0; i < vecA.length; i++){
//         distance += Math.abs(vecA[i]-vecB[i])
//     }
//     return distance
// }

// function getSentenceVector(sentence: string, vectors: { [key: string]: number[] }): number[] {
//     const words = sentence.split(' ');
//     const sentenceVector: number[] = [];
//     let wordCount = 0;
  
//     words.forEach(word => {
//       const vector = getWordVector(word, vectors);
//       if (vector) {
//         if (sentenceVector.length === 0) {
//           vector.forEach(val => sentenceVector.push(val));
//         } else {
//           vector.forEach((val, index) => {
//             sentenceVector[index] += val;
//           });
//         }
//         wordCount++;
//       }
//     });
  
//     return sentenceVector.map(val => val / wordCount);
// }
  
// const filePath = path.resolve(__dirname, 'glove.6B.100d.txt');
// const vectors = loadVectors(filePath);

// const vectorKing = getWordVector('king', vectors);
// const vectorQueen = getWordVector('man', vectors);

// if (vectorKing && vectorQueen) {
//   const cosTheta = manhattan(vectorKing, vectorQueen);
//   console.log(`Cosine similarity between "king" and "queen":`, cosTheta);
// } else {
//   console.log(`One or both words not found.`);
// }