import React, { useState, useEffect } from 'react';
import { createFFmpeg } from '@ffmpeg/ffmpeg';

export const useFfmpeg = () => {
	const ffmpeg = createFFmpeg({
		corePath: '../../@ffmpeg/core/dist/ffmpeg-core.js',
		log: true,
	});
	const [loaded, setLoaded] = useState(false);
	const [ffmpegInstance, setFfmpegInstance] = useState(ffmpeg); //resolves useEffect scope issues

	useEffect(() => {
		const load = async () => {
			await ffmpeg.load();
			setFfmpegInstance(ffmpeg);
			setLoaded(true);
		};
		load();
	}, []);

	return { loaded, ffmpegInstance };
};
