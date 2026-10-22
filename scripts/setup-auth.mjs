import { exportJWK, exportPKCS8, generateKeyPair } from 'jose';
import { spawnSync } from 'node:child_process';
const keys = await generateKeyPair('RS256', {extractable:true});
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
for (const [name,value] of Object.entries({JWT_PRIVATE_KEY:privateKey.trimEnd().replace(/\n/g,' '),JWKS:JSON.stringify({keys:[{use:'sig',...publicKey}]})})) {
 const result=spawnSync('npx',['convex','env','set',name],{input:value,encoding:'utf8'});
 if(result.status!==0)throw new Error(`Failed to configure ${name}`);
 console.log(`Configured ${name}`);
}
