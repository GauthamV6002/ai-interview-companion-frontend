"use server"

import { StreamClient } from "@stream-io/node-sdk";
import { config } from 'dotenv';


config();

const STREAM_API_KEY = process.env.STREAM_API_KEY || "";
const STREAM_API_SECRET = process.env.STREAM_API_SECRET || "";

const client = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

export async function POST(req: Request) {
    const data = await req.json();

    console.log(data)

    if (!data.userId) {
        console.log(`Invalid or missing user ID in request. Recieved: `, data);
        return Response.json({ message: "Missing user ID in request body!" });
    }

    const validity = 24 * 60 * 60;
    const token = client.generateUserToken({ user_id: data.userId, validity_in_seconds: validity });

    return Response.json({
        token: token
    });

}