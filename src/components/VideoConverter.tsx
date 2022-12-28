import React, { useEffect, useState, useRef } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { Brush } from '@visx/brush';

const VideoConverter = () => {
	const ffmpeg = createFFmpeg({
		corePath: '../../@ffmpeg/core/dist/ffmpeg-core.js',
		log: true,
	});
	const [inputMedia, setInputMedia] = useState<File>();
	const [outputMedia, setOutputMedia] = useState<string>();
	const [loaded, setLoaded] = useState(false);
	const [ffmpegInstance, setFfmpegInstance] = useState(ffmpeg); //resolves useEffect scope issues
	const vidRef = useRef(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
	};
	const handleConvert = async () => {
		if (!inputMedia) {
			alert('Submit a video first');
			return;
		}
		console.log('inside', ffmpegInstance.isLoaded());

		ffmpegInstance.FS(
			'writeFile',
			inputMedia.name,
			await fetchFile(inputMedia)
		);
		await ffmpegInstance.run(
			'-i',
			inputMedia.name,
			'-t',
			'1.0',
			'-ss',
			'2.0',
			'-f',
			'gif',
			`${inputMedia.name}.gif`
		);
		const output = ffmpegInstance.FS('readFile', `${inputMedia.name}.gif`);
		const outUrl = URL.createObjectURL(
			new Blob([output.buffer], { type: 'image/gif' })
		);
		setOutputMedia(outUrl);
	};

	const load = async () => {
		await ffmpeg.load();
		setFfmpegInstance(ffmpeg);
		setLoaded(true);
	};

	useEffect(() => {
		load();
	}, []);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) setInputMedia(file);
	}

	return (
		<>
			{loaded ? (
				<>
					{inputMedia ? (
						<>
							<video
								src={URL.createObjectURL(inputMedia)}
								ref={vidRef}
								controls></video>
							<Brush />
						</>
					) : (
						<div>Submit a video</div>
					)}
					<form onSubmit={handleSubmit}>
						<input type='file' accept='video/*' onChange={handleFileChange} />
						<button onClick={handleConvert}>Convert</button>
					</form>
					{outputMedia && <img src={outputMedia} />}
				</>
			) : (
				<div>Loading...</div>
			)}
		</>
	);
};

export default VideoConverter;
