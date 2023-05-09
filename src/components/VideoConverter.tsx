import React, { useCallback, useState, useRef } from 'react';
import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg';
import { useFfmpeg } from '../hooks/useFfmpeg';
import '../styles/Timeline.scss';

const VideoConverter = () => {
	const [loaded, ffmpeg] = useFfmpeg();
	const [inputMedia, setInputMedia] = useState<File>();
	const [outputMedia, setOutputMedia] = useState<string>();
	const [thumbnails, setThumbnails] = useState<Array<string>>([]);
	const [thumbnailoaded, setThumbnailLoaded] = useState(false);

	const vidRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const timelineRef = useRef<HTMLDivElement>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		setThumbnailLoaded(false);

		if (file) setInputMedia(file);
	};
	const handleConvert = async () => {
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

	const handleTimelineClick = (e: React.MouseEvent) => {
		if (!vidRef.current) return;
		const timeLine = timelineRef.current as HTMLDivElement;
		const clickedPositionX = e.clientX - timeLine.offsetLeft;
		const clickedTime = clickedPositionX / timeLine.offsetWidth;

		vidRef.current.currentTime = clickedTime * vidRef.current.duration;
	};

	const createThumbnails = async () => {
		if (!inputMedia) {
			alert('video not loaded yet');
			return;
		}

		console.log('createThumbnail');
		if (!thumbnailoaded) {
			const vidCurrent = vidRef.current as HTMLVideoElement;
			const thumbnailNumber =
				(timelineRef.current as HTMLDivElement).clientWidth / 160;
			const interval = vidCurrent.duration / thumbnailNumber;
			console.log('interval', interval);
			console.log('thumbNailNumber', thumbnailNumber);

			ffmpeg.FS('writeFile', inputMedia.name, await fetchFile(inputMedia));

			await ffmpeg.run(
				'-i',
				inputMedia.name,
				'-vf',
				`fps=1/${interval}`,
				`${inputMedia.name}-%03d.jpg`
			);

			const imageNames = Array.from(
				Array.from(Array(thumbnailNumber).keys()),
				(_, i) => `${inputMedia.name}-${('00' + (i + 1)).slice(-3)}.jpg`
			);
			debugger;
			const images = imageNames.map(
				(imageName) => ffmpeg.FS('readFile', imageName).buffer
			);

			// Create URLs for the extracted images
			const imageUrls = images.map((image) =>
				URL.createObjectURL(new Blob([image], { type: 'image/jpeg' }))
			);
			setThumbnails(imageUrls);
			setThumbnailLoaded(true);
			console.log(thumbnails);
		}
		const fileNames = ffmpeg.FS('readdir', '/');
		console.log('File Names', fileNames);
	};
	// const createThumbnails = useCallback(() => {

	// }, [thumbnailoaded]);

	return (
		<>
			{loaded ? (
				<>
					{inputMedia ? (
						<React.Fragment>
							<video
								src={URL.createObjectURL(inputMedia)}
								ref={vidRef}
								onLoadedData={createThumbnails}
								controls
							/>
							<div
								className='timeline'
								onClick={handleTimelineClick}
								ref={timelineRef}
								//TODO: Markers
							>
								{thumbnails.map((thumbnail, i) => (
									<img
										key={i}
										src={thumbnail}
										alt='Video thumbnail'
										className='timelineImg'
									/>
								))}
							</div>
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
