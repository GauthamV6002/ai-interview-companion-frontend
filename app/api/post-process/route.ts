"use server"

import { config } from 'dotenv';

config();

export async function POST(req: Request) {

    const data = await req.json();

    console.log(data);

    return Response.json(data);
}