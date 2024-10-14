// import { QdrantClient } from "@qdrant/js-client-rest";
// import 'isomorphic-fetch';
// global.FormData = require('form-data');

// const client = new QdrantClient({ host: "localhost", port: 6333 });

import { QdrantClient } from "@qdrant/js-client-rest";
import 'isomorphic-fetch';
import pdf from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as readline from 'readline';

if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = function structuredClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}


import fs from 'fs';
global.FormData = require('form-data');

const client = new QdrantClient({ host: "localhost", port: 6333 });

const pdfFile = './An_Introduction_to_Japan.pdf';

const collectionName = 'Manhattan Similarity'

const question = "What are some highlights from this country?"
const filePath = path.resolve(__dirname, 'glove.6B.100d.txt');

const trainedVectors = loadVectors(filePath);



async function deleteAllPoints() {
  await client.deleteCollection(collectionName);
}

async function createCollection(){
	client.createCollection(collectionName, {
		vectors: { size: 100, distance: "Cosine" },
	});
}

async function extractTextFromPDF(filePath: any) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);
  const sentences: string[] = [];

  pdfData.text.split('. ').forEach((sentence) => {
    sentences.push(sentence.trim());
  });

  return sentences;
}

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

async function loadVectors(filePath: string): Promise<{ [key: string]: number[] }> {
	const vectors: { [key: string]: number[] } = {};
	const fileStream = fs.createReadStream(filePath);
  
	const rl = readline.createInterface({
	  input: fileStream,
	  crlfDelay: Infinity,
	});
  
	for await (const line of rl) {
	  const [word, ...vector] = line.split(' ');
	  vectors[word] = vector.map(Number);
	}
  
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

async function main() {
  const sectionTexts = await extractTextFromPDF(pdfFile);

  sectionTexts.forEach(async (text, index) => {
    const vectors = getSentenceVector(text, await trainedVectors);
    const uploadPayload = {
      points: [
        {
          id: uuidv4(),
          payload: {
            text,
            section: index + 1,
          },
          vector: vectors,
        },
      ],
    };

    client.upsert(collectionName, uploadPayload).then(response => {
      console.log(response);
    }).catch(error => {
      console.error(error);
    });
  });
}

function dotProduct(vecA: number[], vecB: number[]): number {
  return vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
}

function magnitude(vec: number[]): number {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

function euclidean(vecA: number[], vecB: number[]): number {
    const subtracted = vecA.map((i, n) => i - vecB[n]);
    const powered = subtracted.map(e => Math.pow(e, 2));
    const sum = powered.reduce((total, current) => total + current, 0)
    return Math.sqrt(sum);
}

function manhattan(vecA: number[], vecB: number[]): number {
    let distance = 0
    for (let i = 0; i < vecA.length; i++){
        distance += Math.abs(vecA[i]-vecB[i])
    }
    return distance
}


async function askQuestion(){
	const queryVector = getSentenceVector(question, await trainedVectors)

	const answers = await client.query(collectionName, {
		query: queryVector,
		params: {
			hnsw_ef: 128,
			exact: false,
		},
		limit: 5,
		with_vector: true,
		with_payload: true
	})

	if (answers) {

			let totalScore = 0;
			let scoreArray = []
			for (let i = 0; i < answers.points.length; i++) {
				const answer = answers.points[i];
				totalScore += answer.score;
				scoreArray.push(answer.score)
			}
			console.log("Returned vectors:", scoreArray)
			console.log("Average Similarity:", totalScore/answers.points.length)
	} else {
			console.log("Vector not found in the response.");
	}
}

askQuestion().catch(error => {
  console.error(error);
});