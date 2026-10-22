import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const url = process.env.CONVEX_URL || 'https://patient-raccoon-416.convex.cloud';
const tag = Date.now().toString(36);
const accounts = {};
for (const role of ['shopper', 'manager']) {
  const email = `${role}.${tag}@example.test`;
  const password = randomBytes(18).toString('base64url');
  const client = new ConvexHttpClient(url);
  const result = await client.action(anyApi.auth.signIn, {provider:'password', params:{flow:'signUp',email,password,name:role==='manager'?'Market Street Team':'Alex Shopper'}});
  if(!result.tokens?.token)throw new Error(`${role} signup did not return a session`);
  client.setAuth(result.tokens.token);
  if(role==='manager'){
    const grant=spawnSync('npx',['convex','run','profiles:grantManager',JSON.stringify({email})],{encoding:'utf8'});
    if(grant.status!==0)throw new Error('Manager grant failed');
  }
  const profile=await client.query(anyApi.profiles.me,{});
  if(profile?.role!==role)throw new Error(`${role} role mismatch`);
  await client.mutation(anyApi.profiles.updateName,{name:role==='manager'?'Market Street Team':'Alex Shopper'});
  await client.action(anyApi.auth.signOut,{});
  client.clearAuth();
  const login=await client.action(anyApi.auth.signIn,{provider:'password',params:{flow:'signIn',email,password}});
  if(!login.tokens?.token)throw new Error(`${role} sign-in failed`);
  accounts[role]={email,password,token:login.tokens.token};
  console.log(`${role}: registration, role, profile edit, sign-out and sign-in passed`);
}
mkdirSync('artifacts/private',{recursive:true});
writeFileSync('artifacts/private/dev-accounts.json',JSON.stringify(accounts,null,2),{mode:0o600});
console.log('Development credentials saved privately to artifacts/private/dev-accounts.json');
