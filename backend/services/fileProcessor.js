const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');

/**
 * Extract text content from uploaded files
 * Supports .txt and .docx formats
 */
class FileProcessor {
  /**
   * Process uploaded file and extract text content
   * @param {Object} file - Multer file object
   * @returns {Promise<string>} - Extracted text content
   */
  static async extractTextFromFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    
    try {
      switch (ext) {
        case '.txt':
          return await this.extractFromTxt(file.path);
        
        case '.docx':
          return await this.extractFromDocx(file.path);
        
        default:
          throw new Error(`Unsupported file type: ${ext}`);
      }
    } finally {
      // Clean up: Delete the temporary file after processing
      await this.deleteFile(file.path);
    }
  }

  /**
   * Extract text from .txt file
   * @param {string} filePath - Path to the text file
   * @returns {Promise<string>} - File content
   */
  static async extractFromTxt(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.trim();
    } catch (error) {
      throw new Error(`Failed to read .txt file: ${error.message}`);
    }
  }

  /**
   * Extract text from .docx file using mammoth
   * @param {string} filePath - Path to the docx file
   * @returns {Promise<string>} - Extracted text content
   */
  static async extractFromDocx(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.trim();
    } catch (error) {
      throw new Error(`Failed to read .docx file: ${error.message}`);
    }
  }

  /**
   * Delete temporary file
   * @param {string} filePath - Path to file to delete
   */
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`✓ Temporary file deleted: ${path.basename(filePath)}`);
    } catch (error) {
      console.warn(`⚠ Failed to delete temporary file: ${error.message}`);
    }
  }

  /**
   * Validate extracted content
   * @param {string} content - Extracted text
   * @returns {Object} - Validation result
   */
  static validateContent(content) {
    if (!content || content.trim().length === 0) {
      return {
        isValid: false,
        error: 'File is empty or contains no readable text'
      };
    }

    if (content.length < 50) {
      return {
        isValid: false,
        error: 'File content is too short (minimum 50 characters required)'
      };
    }

    if (content.length > 50000) {
      return {
        isValid: false,
        error: 'File content is too long (maximum 50,000 characters allowed)'
      };
    }

    return { isValid: true };
  }
}

module.exports = FileProcessor;
