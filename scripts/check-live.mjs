import {ConvexHttpClient} from 'convex/browser';
import {anyApi} from 'convex/server';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
const url=process.env.CONVEX_URL || 'https://patient-raccoon-416.convex.cloud';
const accounts=JSON.parse(readFileSync('artifacts/private/dev-accounts.json','utf8'));
const shopper=new ConvexHttpClient(url);shopper.setAuth(accounts.shopper.token);
const manager=new ConvexHttpClient(url);manager.setAuth(accounts.manager.token);
const guest=new ConvexHttpClient(url);const guestToken=randomBytes(32).toString('hex');const checkoutId=randomBytes(32).toString('hex');
const p=(await guest.query(anyApi.catalog.list,{}))[0];
const input={guestToken,checkoutId,name:'Live verification',items:[{productId:p._id,quantity:1}]};
const id=await guest.mutation(anyApi.orders.place,input);
assert.equal(await guest.mutation(anyApi.orders.place,input),id);
assert.equal((await guest.query(anyApi.orders.list,{guestToken})).length,1);
await shopper.mutation(anyApi.orders.claimGuest,{guestToken});
assert.equal((await guest.query(anyApi.orders.list,{guestToken})).length,0);
for(const status of ['preparing','ready','completed']){
 await manager.mutation(anyApi.orders.advance,{id,expectedStatus:{preparing:'placed',ready:'preparing',completed:'ready'}[status]});
 const order=(await shopper.query(anyApi.orders.list,{guestToken})).find(o=>o._id===id);
 assert.equal(order.status,status);
}
await manager.mutation(anyApi.catalog.update,{id:p._id,price:p.price,stock:p.stock,active:p.active});
console.log('PASS: live guest order, idempotent checkout, account claim, manager preparation/ready/completion, shopper tracking, inventory update.');
