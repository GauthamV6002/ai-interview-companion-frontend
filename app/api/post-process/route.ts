"use server"

import { config } from 'dotenv';

config();

export async function GET(req: Request) {

    const data = await req.json();

    console.log(data);

    return Response.json(data);
}