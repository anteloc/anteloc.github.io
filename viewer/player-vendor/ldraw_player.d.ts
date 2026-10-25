/* tslint:disable */
/* eslint-disable */

/**
 * Plays back how an LDraw model is built, on a canvas.
 *
 * ```js
 * import init, { Player } from "./ldraw_player.js";
 * await init();
 * const player = await Player.create(canvas, { libraryUrl: "/ldraw/", resolverUrl: "/ldraw-id/" });
 * await player.load("/models/car.mpd");
 * ```
 */
export class Player {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Sets up rendering on `canvas` and loads the colour definitions.
     *
     * Options (all optional): `libraryUrl` (the LDraw folder with LDConfig.ldr,
     * parts/ and p/; default "ldraw/"), `resolverUrl` (a URL that serves any
     * part by name, see README), `background` ("#rrggbb"), `antialias`,
     * `autoplay` and `autoRotate` (all true), `maxPixelRatio` (2),
     * `backend` ("webgl" to skip WebGPU).
     */
    static create(canvas: HTMLCanvasElement, options: any): Promise<Player>;
    /**
     * Stops rendering and removes the event listeners.
     */
    destroy(): void;
    /**
     * Like `load`, for a model given as text. `baseUrl`: where to look for
     * files it references that aren't in the library.
     */
    loadText(text: string, base_url?: string | null, on_progress?: Function | null): Promise<any>;
    /**
     * Loads and plays the model at `url` (.ldr/.mpd/.dat).
     *
     * Resolves to `{parts, steps, duration, missing}` (`missing`: files that
     * couldn't be found; those parts are left out), or to `null` if another
     * load started in the meantime. `onProgress(stage, done, total)` is called
     * with stage "parts" (files fetched; total 0: not known yet) and "prepare".
     */
    load(url: string, on_progress?: Function | null): Promise<any>;
    /**
     * `callback()` runs after frames in which the playback state changed
     * (time, playing, speed, a new model).
     */
    onChange(callback?: Function | null): void;
    pause(): void;
    /**
     * Plays from where it is; from the start once the build has finished.
     */
    play(): void;
    /**
     * Back to the default view of the whole model.
     */
    resetView(): void;
    /**
     * Jumps to `time` seconds (keeps playing if it was).
     */
    seek(time: number): void;
    /**
     * "#rrggbb".
     */
    setBackground(color: string): void;
    /**
     * The step (0-based) being built at `time`.
     */
    stepAt(time: number): number;
    /**
     * When each step starts, seconds: the "chapters".
     */
    stepTimes(): Float32Array;
    /**
     * Whether the camera turns slowly while playing.
     */
    autoRotate: boolean;
    /**
     * "webgpu" or "gl".
     */
    readonly backend: string;
    /**
     * "inspect" (orbit, pan, zoom into the model) or "walk" (first person:
     * mouse looks, W A S D move, E/Q up/down, Shift runs, scroll flies).
     */
    cameraMode: string;
    /**
     * Length of the build at 1x speed, seconds.
     */
    readonly duration: number;
    /**
     * Parts placed by the build (each use of a submodel counts its parts again).
     */
    readonly partCount: number;
    readonly playing: boolean;
    speed: number;
    readonly stepCount: number;
    /**
     * Playback position, seconds.
     */
    readonly time: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_player_free: (a: number, b: number) => void;
    readonly player_autoRotate: (a: number) => number;
    readonly player_backend: (a: number) => [number, number];
    readonly player_cameraMode: (a: number) => [number, number];
    readonly player_create: (a: any, b: any) => any;
    readonly player_destroy: (a: number) => void;
    readonly player_duration: (a: number) => number;
    readonly player_load: (a: number, b: number, c: number, d: number) => any;
    readonly player_loadText: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly player_onChange: (a: number, b: number) => void;
    readonly player_partCount: (a: number) => number;
    readonly player_pause: (a: number) => void;
    readonly player_play: (a: number) => void;
    readonly player_playing: (a: number) => number;
    readonly player_resetView: (a: number) => void;
    readonly player_seek: (a: number, b: number) => void;
    readonly player_setBackground: (a: number, b: number, c: number) => void;
    readonly player_set_autoRotate: (a: number, b: number) => void;
    readonly player_set_cameraMode: (a: number, b: number, c: number) => void;
    readonly player_set_speed: (a: number, b: number) => void;
    readonly player_speed: (a: number) => number;
    readonly player_stepAt: (a: number, b: number) => number;
    readonly player_stepCount: (a: number) => number;
    readonly player_stepTimes: (a: number) => any;
    readonly player_time: (a: number) => number;
    readonly wasm_bindgen__convert__closures_____invoke__h844174bb14f3967f: (a: number, b: number, c: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h25e0de01fef01f72: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__hd9b575669a0d9c45: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h0d370aae8c916f6b: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h6c9cc0c3ee452152: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h9709137129f63bf7: (a: number, b: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
