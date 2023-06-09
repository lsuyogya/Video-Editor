import React, { useState, useEffect } from 'react';
import { createFFmpeg } from '@ffmpeg/ffmpeg';

export const useFfmpeg = () => {
	const ffmpeg = createFFmpeg({
		corePath: '../../../node_modules/@ffmpeg/core/dist/ffmpeg-core.js',
		log: true,
	});
	const [loaded, setLoaded] = useState(false);
	const [progress, setProgress] = useState(0);
	const [log, setLog] = useState(['Log Start']);
	const [ffmpegInstance, setFfmpegInstance] = useState(ffmpeg); //resolves useEffect scope issues

	useEffect(() => {
		const load = async () => {
			await ffmpeg.load();
			setFfmpegInstance(ffmpeg);
			setLoaded(true);
		};
		load();
		ffmpeg.setProgress(({ ratio }) => {
			setProgress(ratio);
			/*
			 * ratio is a float number between 0 to 1.
			 */
		});
		ffmpeg.setLogger(({ type, message }) => {
			setLog((current) => [...current, `${type}: ${message}`]);
		});
	}, []);

	return { loaded, ffmpegInstance, progress, log };
};
