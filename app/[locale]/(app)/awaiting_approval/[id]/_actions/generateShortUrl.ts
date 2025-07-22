'use server';

import PostModel from "@/database/post/post.model";
import { IPost } from "@/types/post.type";

export const generateShortURL = async (url: string, postId: string): Promise<IPost | null> => {
    try {
        const res = await fetch(process.env.NEXT_PUBLIC_SHORT_IO_URL!, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'authorization': process.env.NEXT_PUBLIC_SHORT_IO_KEY!
            },
            body: JSON.stringify({
                allowDuplicates: false,
                domain: process.env.NEXT_PUBLIC_SHORT_IO_DOMAIN!,
                originalURL: url,
            })
        });
        const data = await res.json();
        await PostModel.findByIdAndUpdate(postId, { short_url: data.shortURL });
        const post = await PostModel.findById(postId);
        return post;
    } catch (error) {
        console.error('Error generating short URL:', error);
        return null;
    }
};