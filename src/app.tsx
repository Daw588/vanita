import React from "react";

import styles from "./styles/App.module.scss";

import * as util from "./modules/util";
import * as AvatarAPI from "./types/api/avatar";

async function MakeChanges(config: AvatarAPI.ThumbnailCustomization) {
	return fetch("https://avatar.roblox.com/v1/avatar/thumbnail-customization", {
		method: "POST",
		headers: new Headers({
			"Content-Type": "application/json",
			"x-csrf-token": await util.getCsrfToken()
		}),
		credentials: "include",
		body: JSON.stringify(config)
	});
}

type ConstrainedNumberInputParams = {
	get: number,
	set: React.Dispatch<React.SetStateAction<number>>,
	min: number,
	max: number,
	step: number
}

function ConstrainedNumberInput({ get, set, min, max, step }: ConstrainedNumberInputParams) {
	function updateVariable(e: React.ChangeEvent<HTMLInputElement>) {
		const raw = e.target.value;
		const formatted = ((Number.isInteger(step)) ? parseInt(raw) : parseFloat(raw)) || 0;
		const constrained = util.clamp(formatted, min, max);

		set(constrained);
	}

	return (
		<input
			type="number"
			placeholder={get.toString()}
			min={min}
			max={max}
			step={step}
			defaultValue={get}
			onChange={updateVariable}
			onBlur={e => e.target.value = get.toString()} />
	);
}

function GetPreferences() {
	// "{}" because we dont want to get an error if null/undefined is passed into parse!
	return JSON.parse(window.localStorage.getItem("rwp-preferences") || "{}");
}

function SetPreferences(value: unknown) {
	window.localStorage.setItem("rwp-preferences", JSON.stringify(value));
}

export default function App() {
	const [cameraDistance, setCameraDistance] = React.useState(2);
	const [cameraFieldOfView, setCameraFieldOfView] = React.useState(30);
	const [cameraHorizontalRotation, setCameraHorizontalRotation] = React.useState(0);
	const [cameraVerticalRotation, setCameraVerticalRotation] = React.useState(0);
	const [emoteId, setEmoteId] = React.useState(0);
	const [thumbnailType, setThumbnailType] = React.useState<1 | 2>(1);

	const [loading, setLoading] = React.useState(true);

	const handleRef = React.useRef();
	const baseRef = React.useRef();

	React.useEffect(() => {
		if (handleRef.current && baseRef.current) {
			util.makeDraggable(baseRef.current, handleRef.current);
		}

		if (!loading) {
			return;
		}

		if (window) {
			/*
				{} because if preferences don't exist yet for this API,
				we will get nil/undefined which is what we want to avoid.
			*/
			const config = GetPreferences().ThumbnailCustomization || {};

			setCameraDistance(config.cameraDistance || cameraDistance);
			setCameraFieldOfView(config.cameraFieldOfView || cameraFieldOfView);
			setCameraHorizontalRotation(config.cameraHorizontalRotation || cameraHorizontalRotation);
			setCameraVerticalRotation(config.cameraVerticalRotation || cameraVerticalRotation);
			setEmoteId(config.emoteId || emoteId);
			setThumbnailType(config.thumbnailType || thumbnailType);
		}

		setLoading(false);
	}, [
		loading,
		cameraDistance,
		cameraFieldOfView,
		cameraHorizontalRotation,
		cameraVerticalRotation,
		emoteId,
		thumbnailType
	]);

	async function rerender() {
		const preferences = GetPreferences();
		preferences.ThumbnailCustomization = {
			cameraDistance,
			cameraFieldOfView,
			cameraHorizontalRotation,
			cameraVerticalRotation,
			emoteId,
			thumbnailType
		};

		SetPreferences(preferences);

		const res = await MakeChanges({
			camera: {
				distanceScale: cameraDistance,
				fieldOfViewDeg: cameraFieldOfView,
				xRotDeg: cameraVerticalRotation,
				yRotDeg: cameraHorizontalRotation
			},
			emoteAssetId: emoteId,
			thumbnailType: thumbnailType
		});

		if (res.ok) {
			document.location.reload();
		}
	}

	async function mimicDefaults() {
		const resA = await MakeChanges({
			camera: {
				distanceScale: 0.7,
				fieldOfViewDeg: 30,
				xRotDeg: 10,
				yRotDeg: 0
			},
			emoteAssetId: 0,
			thumbnailType: 1
		});

		const resB = await MakeChanges({
			camera: {
				distanceScale: 1.25,
				fieldOfViewDeg: 30,
				xRotDeg: 20,
				yRotDeg: 0
			},
			emoteAssetId: 0,
			thumbnailType: 2
		});

		if (resA.ok && resB.ok) {
			document.location.reload();
		}
	}

	if (loading) {
		return <p>Loading...</p> ;
	}

	return (
		<div className={styles.window} ref={baseRef}>
			<div className={styles.header} ref={handleRef}>
				<div>Thumbnail Customization</div>
			</div>
			<div className={styles.content}>
				<fieldset>
					<legend>Camera</legend>
					<div className={styles.property}>
						<label>Distance</label>
						<ConstrainedNumberInput
							get={cameraDistance}
							set={setCameraDistance}
							min={0.5}
							max={4}
							step={0.1} />
					</div>
					<div className={styles.property}>
						<label>Field Of View</label>
						<ConstrainedNumberInput
							get={cameraFieldOfView}
							set={setCameraFieldOfView}
							min={15}
							max={45}
							step={1} />
					</div>
					<div className={styles.property}>
						<label>Horizontal Rotation</label>
						<ConstrainedNumberInput
							get={cameraHorizontalRotation}
							set={setCameraHorizontalRotation}
							min={-60}
							max={60}
							step={1} />
					</div>
					<div className={styles.property}>
						<label>Vertical Rotation</label>
						<ConstrainedNumberInput
							get={cameraVerticalRotation}
							set={setCameraVerticalRotation}
							min={-20}
							max={20}
							step={1} />
					</div>
				</fieldset>
				<fieldset>
					<legend>General</legend>
					<div className={styles.property}>
						<label>Thumbnail Type</label>
						<select onClick={e => setThumbnailType(parseInt((e.target as HTMLInputElement).value) as 1 | 2)} defaultValue={thumbnailType}>
							<option value="1">Headshot</option>
							<option value="2">Bodyshot</option>
						</select>
					</div>
					<div className={styles.property}>
						<label>Emote Id</label>
						<input
							type="number"
							defaultValue={emoteId}
							onChange={e => setEmoteId(parseInt(e.target.value))} />
					</div>
				</fieldset>
				<div className={styles.controls}>
					<button onClick={rerender}>Re-Render</button>
					<button onClick={mimicDefaults}>Mimic Defaults</button>
				</div>
			</div>
		</div>
	);
}
