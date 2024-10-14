const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

// Function to convert a 32-bit float to 16-bit half-precision float
function f32tof16(value: number) {
	const floatView = new Float32Array(1);
	const int32View = new Uint32Array(floatView.buffer);

	floatView[0] = value;
	const x = int32View[0]!;

	const sign = (x >> 16) & 0x8000;
	const exponent = ((x >> 23) & 0xff) - 127;
	const fraction = x & 0x7fffff;

	if (exponent < -14) {
		return sign; // Too small for subnormals
	} else if (exponent > 15) {
		return sign | 0x7c00; // Overflow to infinity
	}

	const halfExponent = (exponent + 15) & 0x1f;
	const halfFraction = fraction >> 13;

	return sign | (halfExponent << 10) | halfFraction;
}

// Function to convert a 16-bit half-precision float to a 32-bit float
function f16tof32(value: number) {
	const sign = (value & 0x8000) << 16;
	const exponent = (value >> 10) & 0x1f;
	const fraction = value & 0x3ff;

	if (exponent === 0) {
		if (fraction === 0) {
			return sign ? -0 : 0; // Signed zero
		}
		return (sign ? -1 : 1) * (2 ** -14) * (fraction / 0x400);
	} else if (exponent === 0x1f) {
		return fraction ? Number.NaN : (sign ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY); // NaN or Infinity
	}

	return (sign ? -1 : 1) * (2 ** (exponent - 15)) * (1 + fraction / 0x400);
}

export class Buffer {
	public readonly arrayBuffer: ArrayBuffer;
	private dataView: DataView;
	private littleEndian: boolean;

	private constructor(arrayBuffer: ArrayBuffer, littleEndian: boolean) {
		this.arrayBuffer = arrayBuffer;
		this.dataView = new DataView(this.arrayBuffer);
		this.littleEndian = littleEndian;
	}

	/*@__INLINE__*/
	public static create(size: number, littleEndian: boolean) {
		const arrayBuffer = new ArrayBuffer(size);
		return new Buffer(arrayBuffer, littleEndian);
	}

	/*@__INLINE__*/
	public static from(data: ArrayBuffer, littleEndian: boolean) {
		return new Buffer(data, littleEndian);
	}

	/*@__INLINE__*/
	public writeu8(offset: number, value: number) {
		this.dataView.setUint8(offset, value);
	}

	/*@__INLINE__*/
	public writeu16(offset: number, value: number) {
		this.dataView.setUint16(offset, value, this.littleEndian);
	}

	/*@__INLINE__*/
	public writeu32(offset: number, value: number) {
		this.dataView.setUint32(offset, value, this.littleEndian);
	}

	/*@__INLINE__*/
	public writeu64(offset: number, value: bigint) {
		this.dataView.setBigUint64(offset, value, this.littleEndian);
	}

	/*@__INLINE__*/
	public writei8(offset: number, value: number) {
		this.dataView.setInt8(offset, value);
	}

	/*@__INLINE__*/
	public writei16(offset: number, value: number) {
		this.dataView.setInt16(offset, value, this.littleEndian);
	}

	/*@__INLINE__*/
	public writei32(offset: number, value: number) {
		this.dataView.setInt32(offset, value, this.littleEndian);
	}

	/*@__INLINE__*/
	public writei64(offset: number, value: bigint) {
		this.dataView.setBigInt64(offset, value, this.littleEndian);
	}

	/*@__INLINE__*/
	public writef16(offset: number, value: number) {
		// TODO: Replace this with setFloat16 when all major browsers implement it
		// at the time of writing this, only Firefox has support for it
		this.dataView.setUint16(offset, f32tof16(value), this.littleEndian);
	}

	/*@__INLINE__*/
	public writef32(offset: number, value: number) {
		this.dataView.setFloat32(offset, value, this.littleEndian);
	}

	/*@__INLINE__*/
	public writef64(offset: number, value: number) {
		this.dataView.setFloat64(offset, value, this.littleEndian);
	}

	/*@__INLINE__*/
	public fill(offset: number, source: ArrayBuffer) {
		new Uint8Array(this.arrayBuffer).set(new Uint8Array(source), offset);
	}

	/*@__INLINE__*/
	public slice(start: number, end: number) {
		return this.arrayBuffer.slice(start, end);
	}

	public writeutf8(offset: number, value: string) {
		const utf8Arr = utf8Encoder.encode(value);
		const utf8Len = utf8Arr.length;
		for (let i = 0; i < utf8Len; i++) {
			this.writeu8(offset + i, utf8Arr[i]!);
		}
		return utf8Len;
	}

	/*@__INLINE__*/
	public readu8(offset: number) {
		return this.dataView.getUint8(offset);
	}

	/*@__INLINE__*/
	public readu16(offset: number) {
		return this.dataView.getUint16(offset, this.littleEndian);
	}

	/*@__INLINE__*/
	public readu32(offset: number) {
		return this.dataView.getUint32(offset, this.littleEndian);
	}

	/*@__INLINE__*/
	public readu64(offset: number) {
		return this.dataView.getBigUint64(offset, this.littleEndian);
	}

	/*@__INLINE__*/
	public readi8(offset: number) {
		return this.dataView.getInt8(offset);
	}

	/*@__INLINE__*/
	public readi16(offset: number) {
		return this.dataView.getInt16(offset, this.littleEndian);
	}

	/*@__INLINE__*/
	public readi32(offset: number) {
		return this.dataView.getInt32(offset, this.littleEndian);
	}

	/*@__INLINE__*/
	public readi64(offset: number) {
		return this.dataView.getBigInt64(offset, this.littleEndian);
	}

	/*@__INLINE__*/
	public readf16(offset: number) {
		return f16tof32(this.dataView.getUint16(offset, this.littleEndian));
	}

	/*@__INLINE__*/
	public readf32(offset: number) {
		return this.dataView.getFloat32(offset, this.littleEndian);
	}

	/*@__INLINE__*/
	public readf64(offset: number) {
		return this.dataView.getFloat64(offset, this.littleEndian);
	}

	public readutf8(offset: number, length: number) {
		const utf8Arr = new Uint8Array(length);
		for (let i = 0; i < length; i++) {
			utf8Arr[i] = this.readu8(offset + i);
		}
		return utf8Decoder.decode(utf8Arr);
	}

	public toBase64() {
		const bytes = new Uint8Array(this.arrayBuffer);
		const len = bytes.byteLength;

		let binary = "";

		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]!);
		}
		
		return btoa(binary);
	}
}
