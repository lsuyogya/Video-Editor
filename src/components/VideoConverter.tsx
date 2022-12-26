import React, { useEffect, useState, useCallback } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const VideoConverter = () => {
	const [inputMedia, setInputMedia] = useState<File>();
	const [outputMedia, setOutputMedia] = useState<string>();
	const [loaded, setLoaded] = useState(false);
	const ffmpeg = createFFmpeg({ log: true });

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputMedia) {
			alert('Submit a video first');
			return;
		}

		ffmpeg.FS('writeFile', inputMedia.name, await fetchFile(inputMedia));
		await ffmpeg.run(
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
		const output = ffmpeg.FS('readFile', `${inputMedia.name}.gif`);
		const outUrl = URL.createObjectURL(
			new Blob([output.buffer], { type: 'image/gif' })
		);
		setOutputMedia(outUrl);
	};

	const load = async () => {
		await ffmpeg.load();
		setLoaded(true);
	};
	// const load = useCallback(async () => {
	// 	await ffmpeg.load();
	// 	setLoaded(true);
	// }, [loaded]);

	useEffect(() => {
		load();
	}, [load]);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) setInputMedia(file);
	}

	return (
		<>
			{loaded ? (
				<>
					{inputMedia ? (
						<video src={URL.createObjectURL(inputMedia)} controls></video>
					) : (
						<div>Submit a video</div>
					)}
					<form onSubmit={handleSubmit}>
						<input type='file' accept='video/*' onChange={handleFileChange} />
						<button>Convert</button>
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
