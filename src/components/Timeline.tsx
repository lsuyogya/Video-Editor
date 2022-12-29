import React from 'react';

const Timeline = () => {
	// # of milliseconds between timeline frame updates
	var updateInterval = 5000;

	// size of the timeline frames
	var frameWidth = 100;
	var frameHeight = 75;

	// number of timeline frames
	var frameRows = 4;
	var frameColumns = 4;
	var frameGrid = frameRows * frameColumns;

	// current frame
	var frameCount = 0;

	// to cancel the timer at end of play
	var intervalId: any;
	var videoStarted = false;

	function startVideo() {
		// only set up the timer the first time the
		// video is started
		if (videoStarted) return;

		videoStarted = true;

		// calculate an initial frame, then create
		// additional frames on a regular timer
		updateFrame();
		intervalId = setInterval(updateFrame, updateInterval);

		// set up a handler to seek the video when a frame
		// is clicked
		var timeline = document.getElementById('timeline');
		const handleTimelineClick = (evt) => {
			var offX = evt.layerX - timeline.offsetLeft;
			var offY = evt.layerY - timeline.offsetTop;

			// calculate which frame in the grid was clicked
			// from a zero-based index
			var clickedFrame = Math.floor(offY / frameHeight) * frameRows;
			clickedFrame += Math.floor(offX / frameWidth);

			// find the actual frame since the video started
			var seekedFrame =
				Math.floor(frameCount / frameGrid) * frameGrid + clickedFrame;

			// if the user clicked ahead of the current frame
			// then assume it was the last round of frames
			if (clickedFrame > frameCount % 16) seekedFrame -= frameGrid;

			// can't seek before the video
			if (seekedFrame < 0) return;

			// seek the video to that frame (in seconds)
			var video = document.getElementById('movies');
			video.currentTime = (seekedFrame * updateInterval) / 1000;

			// then set the frame count to our destination
			frameCount = seekedFrame;
		};
	}

	// paint a representation of the video frame into our canvas
	function updateFrame() {
		var video = document.getElementById('movies');
		var timeline = document.getElementById('timeline');
		var ctx = timeline.getContext('2d');

		// calculate out the current position based on frame
		// count, then draw the image there using the video
		// as a source
		var framePosition = frameCount % frameGrid;
		var frameX = (framePosition % frameColumns) * frameWidth;
		var frameY = Math.floor(framePosition / frameRows) * frameHeight;
		ctx.drawImage(
			video,
			0,
			0,
			400,
			300,
			frameX,
			frameY,
			frameWidth,
			frameHeight
		);

		frameCount++;
	}

	// stop gathering the timeline frames
	function stopTimeline() {
		clearInterval(intervalId);
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) setInputMedia(file);
	}

	return (
		<>
			<input type='file' accept='video/*' />
			<video
				id='movies'
				autoPlay
				onCanPlay={startVideo}
				onEnded={stopTimeline}
				width='400px'
				height='300px'>
				<source
					src='https://youtu.be/-OTc0Ki7Sv0'
					type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
				/>
			</video>
			<canvas id='timeline' width='400px' height='300px' />
		</>
	);
};

export default Timeline;
