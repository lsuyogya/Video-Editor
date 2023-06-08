import React, { useRef, useState } from 'react';

interface TimelineProps {
	vidRef: React.RefObject<HTMLVideoElement>;
	timelineRef: React.RefObject<HTMLDivElement>;
	indexRef: React.RefObject<HTMLDivElement>;
}

const Timeline: React.FC<TimelineProps> = ({
	vidRef,
	timelineRef,
	indexRef,
}) => {
	const [rulerArray, setRulerArray] = useState<Array<number>>([
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
	]);
	const [rulerIndex, setRulerIndex] = useState(0);
	return (
		<div className='timeline' onClick={handleTimelineClick} ref={timelineRef}>
			{rulerArray.map((ruler, i) => (
				<React.Fragment key={ruler}>
					<div className='rulerMarker'>
						<div className='rulerMarkerNumber'>{rulerIndex * 10 + ruler}</div>
					</div>
					{[...Array(9).keys()].map((subRuler, i) => {
						return ruler % 10 !== 0 || ruler === 0 ? (
							<div className='subRulerMarker' key={ruler * 10 + subRuler}></div>
						) : null;
					})}
				</React.Fragment>
			))}
			<div
				className='indexMarker'
				data-xposition={'100px'}
				ref={indexRef}></div>
		</div>
	);

	function handleTimelineClick(e: React.MouseEvent) {
		if (!vidRef.current) return;
		const timeLine = timelineRef.current as HTMLDivElement;
		const clickedPositionX = e.clientX - timeLine.offsetLeft;
		vidRef.current.currentTime =
			rulerIndex * 10 + (clickedPositionX * 10) / timeLine.clientWidth;
	}
};

export default Timeline;
