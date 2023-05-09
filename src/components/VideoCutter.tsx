import React, { useState } from 'react';
import { useFfmpeg } from '../hooks/useFfmpeg';

const VideoCutter = () => {
	const [loaded, ffmpeg] = useFfmpeg();
	const [vidProp, setVidProp] = useState({ min: 0, max: 10 });
	const [inputVideo, setInputVideo] = useState<File>();

	if (!loaded) return <div>Loading...</div>;
	return (
		<form className='cutter-form'>
			{inputVideo ? (
				<>
					<video
						className='video'
						src={URL.createObjectURL(inputVideo)}></video>
					<input
						type='range'
						id='range-input'
						list='range-list'
						min={vidProp.min}
						max={vidProp.max}
						step={0.01}
					/>
					<datalist id='range-list'>
						{[...Array(vidProp.max)].map(
							(x, i) => i % 1 == 0 && <option key={i}> {i}</option>
						)}
					</datalist>
				</>
			) : (
				<div>Submit a video</div>
			)}
			<input type='file' accept='video/*' onChange={handleFileChange} />
		</form>
	);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const currentFile = e.target.files?.[0];
		setInputVideo(currentFile);
	}
};

export default VideoCutter;
