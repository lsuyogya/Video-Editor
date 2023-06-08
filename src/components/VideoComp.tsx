import React from 'react';

interface VideoCompProps {
	inputMedia: File;
	vidRef: React.RefObject<HTMLVideoElement>;
	createTimeline: VoidFunction;
	handleTimeUpdate: VoidFunction;
}

const VideoComp: React.FC<VideoCompProps> = ({
	inputMedia,
	vidRef,
	createTimeline,
	handleTimeUpdate,
}) => {
	return (
		<video
			src={URL.createObjectURL(inputMedia)}
			ref={vidRef}
			onLoadedData={createTimeline}
			controls
			style={{ width: '60rem' }}
			onTimeUpdate={handleTimeUpdate}
		/>
	);
};

export default VideoComp;
