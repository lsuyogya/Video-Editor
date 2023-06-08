import React, { useState, useRef } from 'react';
import { fetchFile } from '@ffmpeg/ffmpeg';
import { useFfmpeg } from '../hooks/useFfmpeg';
import '../styles/Timeline.scss';

const VideoConverter = () => {
	const { loaded, progress, ffmpegInstance, log } = useFfmpeg();
	const [inputMediaUrl, setInputMediaUrl] = useState('');
	const [inputMedia, setInputMedia] = useState<File>();
	const [rulerIndex, setRulerIndex] = useState(0);
	const [args, setArgs] = useState({ startTime: 0, endTime: 0, format: '' });

	const vidRef = useRef<HTMLVideoElement>(null);
	const timelineRef = useRef<HTMLDivElement>(null);
	const indexRef = useRef<HTMLDivElement>(null);

	return (
		<>
			{loaded ? (
				<>
					{inputMediaUrl ? (
						<>
							{/* <nav className='navbar'>
								<ul>
									<li>Convert</li>
								</ul>
							</nav> */}
							<video
								src={inputMediaUrl}
								ref={vidRef}
								onLoadedData={createTimeline}
								controls
								style={{ width: '60rem' }}
								onTimeUpdate={handleTimeUpdate}
							/>

							<div
								className='timeline'
								style={{ width: vidRef.current?.clientWidth }}
								onClick={handleTimelineClick}
								onDrag={handleTimelineClick}
								ref={timelineRef}>
								{[...Array(11).keys()].map((ruler) => (
									<React.Fragment key={ruler}>
										<div className='rulerMarker'>
											<div className='rulerMarkerNumber'>
												{rulerIndex * 10 + ruler}
											</div>
										</div>
										{[...Array(9).keys()].map((subRuler) => {
											return ruler % 10 !== 0 || ruler === 0 ? (
												<div
													className='subRulerMarker'
													key={ruler * 10 + subRuler}></div>
											) : null;
										})}
									</React.Fragment>
								))}
								<div
									className='indexMarker'
									data-xposition={'100px'}
									ref={indexRef}
								/>
							</div>
						</>
					) : (
						<div>Submit a video</div>
					)}
					<form>
						<input type='file' accept='video/*' onChange={handleFileChange} />
					</form>
					<form>
						<legend>Settings</legend>
						Start Time:{' '}
						<input
							type='number'
							id='startTime'
							onChange={handleArgChange}
						/>{' '}
						<br />
						End Time:{' '}
						<input type='number' id='endTime' onChange={handleArgChange} />{' '}
						<br />
						Format:{' '}
						<input
							type='text'
							id='format'
							list='formats'
							onChange={handleArgChange}
						/>
						<datalist id='formats'>
							<option value='mp4' />
							<option value='mp3' />
							<option value='gif' />
						</datalist>
						<br />
					</form>
					<button onClick={handleConvert}>Extract</button>
					{progress ? <div>Progress: {Math.floor(progress * 100)}%</div> : null}
				</>
			) : (
				<div>Loading...</div>
			)}
		</>
	);

	function handleTimeUpdate() {
		const vidTime = vidRef.current?.currentTime ?? 0;
		const timelineLength = timelineRef.current?.clientWidth ?? 0;
		const timelineOffset = timelineRef.current?.offsetLeft ?? 0;
		let newIndex = Math.floor(vidTime / 10);
		// console.log('newIndex', newIndex);
		setRulerIndex(newIndex);
		// rulerIndex.current = newIndex;
		console.log('refShit', rulerIndex);
		const rulerTime = vidTime - 10 * newIndex;
		const xPosition = (timelineLength * rulerTime) / 10;
		if (indexRef.current) indexRef.current.style.left = `${xPosition}px`;
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			setInputMedia(file);
			setInputMediaUrl(URL.createObjectURL(file));
		}
	}

	async function handleConvert(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
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
			`${args.endTime - args.startTime}`,
			// '1',
			'-ss',
			`${args.startTime}`,
			// '0',

			'-f',
			`${args.format}`,
			// 'gif',
			`${inputMedia.name}.${args.format}`
		);
		const output = ffmpegInstance.FS(
			'readFile',
			`${inputMedia.name}.${args.format}`
		);
		const outUrl = URL.createObjectURL(new Blob([output.buffer]));
		const link = document.createElement('a');
		link.href = outUrl;
		link.download = `${inputMedia.name}.${args.format}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function handleTimelineClick(e: React.MouseEvent) {
		e.preventDefault();
		if (!vidRef.current) return;
		const timeLine = timelineRef.current as HTMLDivElement;
		const clickedPositionX = e.clientX - timeLine.offsetLeft;
		vidRef.current.currentTime =
			rulerIndex * 10 + (clickedPositionX * 10) / timeLine.clientWidth;
	}

	async function createTimeline() {
		if (!inputMedia) {
			alert('video not loaded yet');
			return;
		}

		console.log('createTimeline Triggered');
	}

	function handleArgChange(
		e:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
	) {
		setArgs({ ...args, [e.currentTarget.id]: [e.currentTarget.value] });
	}
};

export default VideoConverter;
