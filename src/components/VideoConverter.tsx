import React, { useState, useRef, useEffect } from 'react';
import { fetchFile } from '@ffmpeg/ffmpeg';
import { useFfmpeg } from '../hooks/useFfmpeg';
import '../styles/Timeline.scss';
import '../styles/Form.scss';
import Timeline from './Timeline';

const VideoConverter = () => {
	const { loaded, progress, ffmpegInstance, log } = useFfmpeg();
	const [inputMediaUrl, setInputMediaUrl] = useState('');
	const [inputMedia, setInputMedia] = useState<File>();
	const [rulerIndex, setRulerIndex] = useState(0);
	const [args, setArgs] = useState({
		startTime: 0,
		endTime: 0,
		format: '',
		frameRate: '60',
	});
	const bindings = {
		startTime: {
			currentTime: ['Alt', 'l'],
			minTime: ['Alt', 'Control', 'l'],
		},
		endTime: {
			currentTime: ['Alt', 'k'],
			maxTime: ['Alt', 'Control', 'k'],
		},
	};

	useEffect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (!startTimeRef.current || !endTimeRef.current || !vidRef.current) {
				console.warn('Cannot work with null video or input ref');
				return;
			}
			if (e.altKey && e.key === bindings.startTime.currentTime[1]) {
				//@ts-ignore
				startTimeRef.current.value = vidRef.current.currentTime.toString();
			}
			if (e.altKey && e.key === bindings.endTime.currentTime[1]) {
				//@ts-ignore
				endTimeRef.current.value = vidRef.current.currentTime.toString();
			}
			if (e.altKey && e.ctrlKey && e.key === bindings.startTime.minTime[2]) {
				//@ts-ignore
				startTimeRef.current.value = '0';
			}
			if (e.altKey && e.ctrlKey && e.key === bindings.endTime.maxTime[2]) {
				//@ts-ignore
				endTimeRef.current.value = vidRef.current.duration.toString();
			}
		}
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	}, []);

	const vidRef = useRef<HTMLVideoElement>(null);
	const timelineRef = useRef<HTMLDivElement>(null);
	const indexRef = useRef<HTMLDivElement>(null);
	const startTimeRef = useRef<HTMLInputElement>(null);
	const endTimeRef = useRef<HTMLInputElement>(null);

	return (
		<>
			{loaded ? (
				<>
					{inputMediaUrl ? (
						<React.Fragment>
							{/* Video Source */}
							<video
								src={inputMediaUrl}
								ref={vidRef}
								onLoadedData={createTimeline}
								controls
								style={{ width: '60rem' }}
								onTimeUpdate={handleTimeUpdate}
							/>

							{/* TIMELINE */}
							<div
								className='timeline'
								style={{ width: vidRef.current?.clientWidth }}
								onClick={handleTimelineClick}
								onDrag={handleTimelineClick}
								ref={timelineRef}>
								{[...Array(11).keys()].map((ruler) => (
									<React.Fragment key={ruler}>
										<div
											className={`rulerMarker ${
												/* @ts-ignore */ //cuz when duration doesnt exist, timeline is not rendered
												vidRef.current?.duration <= rulerIndex * 10 + ruler
													? 'passive'
													: ''
											}`}>
											<div
												className={`rulerMarkerNumber ${
													/* @ts-ignore */
													vidRef.current?.duration <= rulerIndex * 10 + ruler
														? 'passiveText'
														: ''
												}`}>
												{rulerIndex * 10 + ruler}
											</div>
										</div>
										{[...Array(9).keys()].map((subRuler) => {
											return ruler % 10 !== 0 || ruler === 0 ? (
												<div
													className={`subRulerMarker ${
														/* @ts-ignore */
														vidRef.current?.duration <=
														rulerIndex * 10 + ruler + subRuler / 10
															? 'passive'
															: ''
													}`}
													key={ruler * 10 + subRuler}></div>
											) : null;
										})}
									</React.Fragment>
								))}
								<div className='indexMarker' ref={indexRef} />
							</div>
						</React.Fragment>
					) : (
						<div>Submit a video</div>
					)}
					<form>
						<input type='file' accept='video/*' onChange={handleFileChange} />
					</form>

					{inputMediaUrl ? (
						<form className='settingsForm'>
							<legend>Settings</legend>
							<div className='formGroup'>
								<label htmlFor='startTime'>Start Time</label>
								<input
									type='number'
									id='startTime'
									ref={startTimeRef}
									className='shortInput'
									onChange={handleArgChange}
								/>
								<span>Set Current Time (Alt + L)</span>
								<span>Minimum Time (Ctrl + Alt + L )</span>
							</div>

							<div className='formGroup'>
								<label htmlFor='endTime'>End Time</label>
								<input
									type='number'
									id='endTime'
									ref={endTimeRef}
									className='shortInput'
									onChange={handleArgChange}
								/>
								<span>Set Current Time (Alt + K)</span>
								<span>Maximum Time (Ctrl + Alt + K )</span>
							</div>

							<div className='formGroup'>
								<label htmlFor='format'>Format</label>
								{/* <input
							type='text'
							id='format'
							list='formats'
							onChange={handleArgChange}
						/> */}
								<select
									id='format'
									onChange={handleArgChange}
									className='shortInput'
									defaultValue={'mp4'}>
									<option value='avi' children={'avi'} />
									<option value='asf' children={'asf'} />
									<option value='mp3' children={'mp3'} />
									<option value='mp4' children={'mp4'} />
									<option value='mpg' children={'mpg'} />
									<option value='gif' children={'gif'} />
								</select>
							</div>

							<button onClick={handleConvert}>Extract</button>
						</form>
					) : null}
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
		const output = ffmpegInstance.FS('readFile', `${inputMedia.name}`);
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
