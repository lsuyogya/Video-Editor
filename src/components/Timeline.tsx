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
			<div className='indexMarker' data-xposition={'100px'} ref={indexRef} />
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
