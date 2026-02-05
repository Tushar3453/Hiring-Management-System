import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load the library
const rawLib = require('pdf-parse');
const PDFParseClass = rawLib.PDFParse;

// Helper: Convert PDF Buffer to Text
export const parseResume = async (buffer: Buffer): Promise<string> => {
    try {
        if (!PDFParseClass) {
            throw new Error("Could not find PDFParse class.");
        }

        console.log("Converting Buffer to Uint8Array...");

        // Convert Node Buffer to standard Uint8Array
        // This satisfies the library's strict type check
        const uint8Array = new Uint8Array(buffer);

        // Instantiate with the converted array
        const parser = new PDFParseClass(uint8Array);

        // Extract Text
        const data = await parser.getText();
        
        // Return Cleaned Text
        const rawText = data.text || (typeof data === 'string' ? data : "");
        return rawText.toLowerCase().replace(/\s+/g, ' ').trim();

    } catch (error) {
        console.error("PDF Parse Error:", error);
        return ""; 
    }
};

// Helper: Calculate Score vs Requirements
export const calculateATSScore = (resumeText: string, jobSkills: string[]) => {
    if (!resumeText || !jobSkills || jobSkills.length === 0) {
        return { score: 0, missingSkills: jobSkills };
    }

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const normalizedText = resumeText.toLowerCase();

    jobSkills.forEach(skill => {
        const normalizedSkill = skill.toLowerCase();
        if (normalizedText.includes(normalizedSkill)) {
            matchedSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    });

    const score = Math.round((matchedSkills.length / jobSkills.length) * 100);

    return { score, missingSkills };
};