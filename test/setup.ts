import { rm } from 'fs/promises';
import { join } from 'path';
import { getConnection } from 'typeorm';


jest.setTimeout(100000);
global.beforeEach(async () => {
    try {
        await rm(join(__dirname, '..','test.sqlite'));
    } catch (error) {
        
    }
})


global.afterEach(async () => {
    const conn =  getConnection()
    await conn.close()
})