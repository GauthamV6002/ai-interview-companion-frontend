"use client"
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


import React, { useState } from 'react'

import { useRouter } from 'next/navigation';
import { ConfigurationMode, useAuth } from '@/context/AuthContext'
import { Protocol } from '@/types/Protocol'

type Props = {}

const page = (props: Props) => {

	const router = useRouter();
	const { configurationMode, participantID, protocol, setConfigurationMode, setParticipantID, setProtocol, setProtocolString } = useAuth();

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

		let file = null;

		if (e.target.files) {
			file = e.target.files[0];
		}

		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				const text = reader.result;
				const parsedProtocol = parseProtocol(String(text));
				setProtocol(parsedProtocol);
			};
			reader.readAsText(file);
		}
	};

	const parseProtocol = (text: string): Protocol => {

		setProtocolString(text);

		const lines = text.split('\n').map((line) => line.trim()).filter((line) => line !== '');
		const protocol: Protocol = [];

		lines.forEach((line) => {
			const mainMatch = line.match(/^(\d+):\s*(.*)/); // Match main questions
			const followUpMatch = line.match(/^(\d+\.\d+):\s*(.*)/); // Match follow-up questions

			if (mainMatch) {
				const mainIndex = mainMatch[1];
				const mainQuestion = mainMatch[2];
				protocol.push({
					id: -1,
					question: mainQuestion,
					followUps: []
				})
				// questionsMap[mainIndex] = { id: mainIndex, question: mainQuestion, followUps: [], issue: true, revision: '' };
			} else if (followUpMatch) {
				// console.log(followUpMatch);
				const mainIndex = Number(followUpMatch[1].split('.')[0]) - 1;
				const followUpQuestion = followUpMatch[2];
				console.log(mainIndex);
				if (protocol[mainIndex]) {
					protocol[mainIndex].followUps.push(followUpQuestion);
				}
			}
		});


		// add indices
		protocol.forEach((val, index) => {
			protocol[index].id = index;
		})

		console.log(protocol);
		return protocol;
	};

	
    const handleJoinRoom = async () => {
      const newRoomId = Math.random().toString(36).substring(2, 7);
      router.push(`/room/${newRoomId}?caller=true`);
    };

	return (
		<div className='w-screen h-screen flex justify-center items-center'>
			<Card>
				<CardHeader>
					<CardTitle className='text-4xl'>Log In</CardTitle>
					<CardDescription className='text-lg'>Sign in with the Participant ID you were given.</CardDescription>
				</CardHeader>
				<CardContent className='flex flex-col gap-2'>
					<Input type='number' onChange={(e) => setParticipantID(Number(e.target.value))} placeholder='Participant ID'></Input>
					<Select onValueChange={(val) => setConfigurationMode(val as ConfigurationMode)}>
						<SelectTrigger className="">
							<SelectValue placeholder="AI Assistance Configuration" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="mode_a">Mode A - Post-Interview</SelectItem>
							<SelectItem value="mode_b">Mode B - Realtime</SelectItem>
						</SelectContent>
					</Select>

					<Label htmlFor="protocolUpload" className='mt-4 ml-1 text-lg'>Upload Your Protocol</Label>
					<Input id="protocolUpload" type='file' onChange={handleFileUpload} className='border-[3px] border-dashed' />

					{
						(!participantID || !configurationMode || !(protocol.length)) ?
							<Button disabled className='mt-6'>Please fill out all fields.</Button>
							:
							// <Link className='w-full' href={"/"}>Continue</Link>
							<Button onClick={() => router.push("/")} className='w-full mt-6'>Join Room</Button>
					}

				</CardContent>
			</Card>
		</div>
	)
}

export default page