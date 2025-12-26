const fs = require('fs');
function replaceInFile(path, replacements){
  let s = fs.readFileSync(path,'utf8');
  for(const r of replacements){
    s = s.split(r.from).join(r.to);
  }
  fs.writeFileSync(path,s);
}

try{
  replaceInFile('backend/services/api-gateway/package.json', [
    { from: '"axios": "^1.4.0",', to: '"axios": "^1.4.0",\n    "sharp": "^0.32.0",' }
  ]);

  replaceInFile('backend/shared/services/model-processor.service.ts', [
    { from: '): Promise<Record<string, string>> {', to: '): Promise<{ high: string; medium: string; low: string }> {' },
    { from: 'const lodUrls: Record<string, string> = {};', to: 'const lodUrls: { high: string; medium: string; low: string } = { high: "", medium: "", low: "" };' },
    { from: 'catch (error) {', to: 'catch (error: any) {' },
    { from: 'console.error(`Error processing model: ${error.message}`);', to: 'console.error(`Error processing model: ${error?.message || error}`);' },
    { from: 'console.error(`Upload failed: ${error.message}`);', to: 'console.error(`Upload failed: ${error?.message || error}`);' }
  ]);

  replaceInFile('backend/shared/services/aurora-ai.service.ts', [
    { from: 'emotionalFitAnalysis: {\n    confidenceBoost: number;\n    authenticity: number;\n    moodImpact: {\n      happiness: number;\n      comfort: number;\n      empowerment: number;\n    };\n  };', to: 'emotionalFitAnalysis: any;' }
  ]);

  replaceInFile('backend/shared/services/database.service.ts', [
    { from: 'async insert<T = any>(table: string, data: Record<string, any>): Promise<T> {', to: 'async insert<T = any>(table: string, data: Record<string, any>): Promise<T | null> {' }
  ]);

  console.log('Patches applied');
}catch(e){
  console.error('Patch failed', e);
  process.exit(1);
}
