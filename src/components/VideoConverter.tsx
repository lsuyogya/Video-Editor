import React, { useEffect, useState, useRef } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { useFfmpeg } from '../hooks/useFfmpeg';
import '../styles/Timeline.scss';

const VideoConverter = () => {
	const { loaded, ffmpegInstance } = useFfmpeg();
	const [inputMedia, setInputMedia] = useState<File>();
	const [outputMedia, setOutputMedia] = useState<string>();
	const vidRef = useRef(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) setInputMedia(file);
	};

	const handleConvert = async () => {
		if (!inputMedia) {
			alert('Submit a video first');
			return;
		}

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

	const handleTimelineClick = (e: React.MouseEvent) => {
		const clickedPositionX = e.clientX - e.target.offsetLeft;
		const clickedTime = clickedPositionX / e.target.offsetWidth;

		vidRef.current.currentTime = clickedTime * vidRef.current.duration;
	};

	return (
		<>
			{loaded ? (
				<>
					{inputMedia ? (
						<React.Fragment>
							<video
								src={URL.createObjectURL(inputMedia)}
								ref={vidRef}
								// controls
							/>
							<div className='timeline' onClick={handleTimelineClick} />
						</React.Fragment>
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
