import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { apiMB } from '../pages/api/kqxsMB';
import { RefreshCw, TrendingUp } from 'lucide-react';

// Box “Thống kê nhanh” đơn giản, tối ưu render
const ThongKeNhanh = React.memo(function ThongKeNhanh() {
	// State
	const [loGanTop, setLoGanTop] = useState([]);
	const [tanSuatTop, setTanSuatTop] = useState([]);
	const [loCapGanPairs, setLoCapGanPairs] = useState([]);
	const [specialGapTop, setSpecialGapTop] = useState([]);
	const [specialSumGaps, setSpecialSumGaps] = useState([]);   // tổng 0-9
	const [specialChamGaps, setSpecialChamGaps] = useState([]);  // chạm 0-9
	const [specialBoGanTop, setSpecialBoGanTop] = useState([]);  // gan theo bộ
	const [specialBoHotTop, setSpecialBoHotTop] = useState([]);  // bộ ra nhiều nhất
	const [specialDauGanTop, setSpecialDauGanTop] = useState([]);
	const [specialDuoiGanTop, setSpecialDuoiGanTop] = useState([]);
	const [specialDauHotTop, setSpecialDauHotTop] = useState([]);
	const [specialDuoiHotTop, setSpecialDuoiHotTop] = useState([]);
	const SPECIAL_DAU_DUOI_DAYS = 365;
	const [specialDauDuoiBoxLoading, setSpecialDauDuoiBoxLoading] = useState(true);
	const [specialDauDuoiBoxError, setSpecialDauDuoiBoxError] = useState(null);
	const [specialDauDuoiMetadata, setSpecialDauDuoiMetadata] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const isUpdatingRef = useRef(false);
	
	// Prediction states
	const [predictionNumbers, setPredictionNumbers] = useState('');
	const [predictionDays, setPredictionDays] = useState(365);
	const [predictionType, setPredictionType] = useState('special'); // 'loto' hoặc 'special'
	const [predictionResult, setPredictionResult] = useState(null);
	const [predictionLoading, setPredictionLoading] = useState(false);
	const [predictionError, setPredictionError] = useState(null);

	// Ngày hôm nay theo server/client (toLocaleDateString đảm bảo hiển thị chuẩn VN)
	const todayStr = useMemo(() => {
		try {
			const now = new Date();
			return now.toLocaleDateString('vi-VN');
		} catch {
			return '';
		}
	}, []);

	// Detect mobile viewport to optimize layout
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 480);
		check();
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', check, { passive: true });
			return () => window.removeEventListener('resize', check);
		}
	}, []);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		isUpdatingRef.current = true;
		try {
			// Lô gan 60 ngày: lấy top 5 gapDraws lớn nhất
			const gan = await apiMB.getLoGanStats(60);
			const ganTop = (gan?.statistics || [])
				.sort((a, b) => (b?.gapDraws || 0) - (a?.gapDraws || 0))
				.slice(0, 30) // hiển thị nhiều mục như mẫu, chia block 5
				.map(item => ({
					number: String(item.number).padStart(2, '0'),
					days: item.gapDraws,
					maxGap: item.maxGap
				}));
			setLoGanTop(ganTop);
			// Tính các cặp lộn có cùng gan cao nhất từ CHÍNH danh sách đang hiển thị (top 30)
			const baseGan = ganTop;
			const byNum = new Map(baseGan.map(x => [x.number, x.days]));
			const seen = new Set();
			const pairs = [];
			baseGan.forEach(x => {
				const rev = x.number.split('').reverse().join('');
				if (byNum.has(rev)) {
					const key = [x.number, rev].sort().join('-');
					if (!seen.has(key) && x.number !== rev) {
						seen.add(key);
						const aDays = byNum.get(x.number) || 0;
						const bDays = byNum.get(rev) || 0;
						pairs.push({
							aNumber: x.number,
							aDays,
							bNumber: rev,
							bDays,
							sortKey: Math.max(aDays, bDays) // ưu tiên cặp có khoảng gan lớn
						});
					}
				}
			});
			pairs.sort((p, q) => q.sortKey - p.sortKey);
			setLoCapGanPairs(pairs.slice(0, 4)); // lấy 4 cặp như mẫu minh họa

			// Tần suất loto 30 ngày: lấy top 5 count lớn nhất
			const ts = await apiMB.getTanSuatLotoStats(30);
			const tsTop = (ts?.statistics || [])
				.sort((a, b) => (b?.count || 0) - (a?.count || 0))
				.slice(0, 30) // hiển thị theo nhóm 5 như mẫu
				.map(item => ({
					number: String(item.number).padStart(2, '0'),
					count: item.count
				}));
			setTanSuatTop(tsTop);

			// Đặc biệt lâu chưa ra: sử dụng API getSpecialDetailedStats thay vì tính toán client-side
			try {
				const detailedStats = await apiMB.getSpecialDetailedStats(365);
				
				if (detailedStats) {
					// Sử dụng dữ liệu từ API thay vì tính toán lại
					const spTop = (detailedStats.numberGaps || [])
						.sort((a, b) => (b.days || 0) - (a.days || 0))
						.slice(0, 25);
					setSpecialGapTop(spTop);

					setSpecialSumGaps(detailedStats.sumGaps || []);
					setSpecialChamGaps(detailedStats.chamGaps || []);
					
					const boGaps = (detailedStats.boGaps || [])
						.sort((a, b) => (b.days || 0) - (a.days || 0))
						.slice(0, 25);
					setSpecialBoGanTop(boGaps);

					const boHotList = (detailedStats.boFrequency || [])
						.sort((a, b) => (b.count || 0) - (a.count || 0))
						.slice(0, 50);
					setSpecialBoHotTop(boHotList);
				} else {
					// Fallback: nếu API chưa có dữ liệu, tính toán như cũ
					console.warn('Thống kê chi tiết chưa có, đang tính toán client-side...');
					const special = await apiMB.getSpecialStats(365);
					const records = special?.statistics || [];
					// Map: lastTwo => lastSeenDate (Date)
					const lastSeen = new Map();
					// Map: sumDigit(0-9) => lastSeenDate
					const sumLastSeen = new Map();
					// Map: chamDigit(0-9) => lastSeenDate
					const chamLastSeen = new Map();
					records.forEach(r => {
						if (!r?.number || !r?.drawDate) return;
						const lastTwo = String(r.number).slice(-2).padStart(2, '0');
						// drawDate dạng dd/mm/yyyy từ backend
						const [d, m, y] = String(r.drawDate).split('/');
						const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
						const existed = lastSeen.get(lastTwo);
						if (!existed || dateObj > existed) {
							lastSeen.set(lastTwo, dateObj);
						}
						// Tổng: (a + b) % 10
						const a = parseInt(lastTwo[0], 10);
						const b = parseInt(lastTwo[1], 10);
						const sumDigit = (a + b) % 10;
						const sumExist = sumLastSeen.get(sumDigit);
						if (!sumExist || dateObj > sumExist) {
							sumLastSeen.set(sumDigit, dateObj);
						}
						// Chạm: mỗi chữ số có mặt trong 2 số cuối
						const digits = new Set([a, b]);
						digits.forEach(dg => {
							const chamExist = chamLastSeen.get(dg);
							if (!chamExist || dateObj > chamExist) {
								chamLastSeen.set(dg, dateObj);
							}
						});
					});
					const today = new Date();
					const dayMs = 24 * 60 * 60 * 1000;
					const gaps = Array.from(lastSeen.entries()).map(([num, dt]) => ({
						number: num,
						days: Math.max(0, Math.round((today - dt) / dayMs))
					}));
					// Với các số không có trong 365 ngày qua, coi như >= 365 ngày
					for (let i = 0; i < 100; i++) {
						const num = String(i).padStart(2, '0');
						if (!lastSeen.has(num)) {
							gaps.push({ number: num, days: 365 });
						}
					}
					const spTop = gaps.sort((a, b) => b.days - a.days).slice(0, 25);
					setSpecialGapTop(spTop);

					// Tổng 0-9 gaps
					const sumGaps = [];
					for (let s = 0; s <= 9; s++) {
						const dt = sumLastSeen.get(s);
						const days = dt ? Math.max(0, Math.round((today - dt) / dayMs)) : 365;
						sumGaps.push({ sum: s, days });
					}
					sumGaps.sort((a, b) => b.days - a.days);
					setSpecialSumGaps(sumGaps);

					// Chạm 0-9 gaps
					const chamGaps = [];
					for (let c = 0; c <= 9; c++) {
						const dt = chamLastSeen.get(c);
						const days = dt ? Math.max(0, Math.round((today - dt) / dayMs)) : 365;
						chamGaps.push({ cham: c, days });
					}
					chamGaps.sort((a, b) => b.days - a.days);
					setSpecialChamGaps(chamGaps);

					// Thống kê gan theo bộ: đối chiếu 2 số cuối với 100 bộ số đặc biệt
					const boLastSeen = new Map(); // Map: setId => lastSeenDate
					const boFreq = new Map(); // Map: setId => count (tần suất xuất hiện)
					records.forEach(r => {
						if (!r?.number || !r?.drawDate) return;
						const lastTwo = String(r.number).slice(-2).padStart(2, '0');
						const [d, m, y] = String(r.drawDate).split('/');
						const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
						// Tìm tất cả các bộ số chứa số này
						const containingSets = findSetsContainingNumber(lastTwo);
						containingSets.forEach(setId => {
							// Cập nhật lastSeenDate
							const existed = boLastSeen.get(setId);
							if (!existed || dateObj > existed) {
								boLastSeen.set(setId, dateObj);
							}
							// Đếm tần suất xuất hiện
							boFreq.set(setId, (boFreq.get(setId) || 0) + 1);
						});
					});
					const boGaps = [];
					// Tính gap cho tất cả 100 bộ (00-99)
					for (let i = 0; i < 100; i++) {
						const setId = String(i).padStart(2, '0');
						const dt = boLastSeen.get(setId);
						const days = dt ? Math.max(0, Math.round((today - dt) / dayMs)) : 365;
						boGaps.push({ setId, days, lastDate: dt ? dt.toLocaleDateString('vi-VN') : null });
					}
					boGaps.sort((a, b) => b.days - a.days);
					setSpecialBoGanTop(boGaps.slice(0, 25)); // Top 25 bộ lâu chưa ra

					// Tính tần suất ra nhiều nhất
					const totalBo = Array.from(boFreq.values()).reduce((sum, val) => sum + val, 0);
					const boHotList = [];
					for (let i = 0; i < 100; i++) {
						const setId = String(i).padStart(2, '0');
						const count = boFreq.get(setId) || 0;
						boHotList.push({
							setId,
							count,
							percentage: totalBo > 0 ? `${((count / totalBo) * 100).toFixed(2)}%` : '0%'
						});
					}
					boHotList.sort((a, b) => (b.count || 0) - (a.count || 0));
					setSpecialBoHotTop(boHotList.slice(0, 50)); // Top 50 bộ ra nhiều nhất
				}
			} catch (e) {
				console.warn('Không thể tải thống kê chi tiết:', e?.message || e);
				setSpecialGapTop([]);
				setSpecialSumGaps([]);
				setSpecialChamGaps([]);
				setSpecialBoGanTop([]);
				setSpecialBoHotTop([]);
			}
		} catch (e) {
			setError(e?.message || 'Không thể tải dữ liệu');
		} finally {
			setLoading(false);
			isUpdatingRef.current = false;
		}
	}, []);

	const fetchSpecialDauDuoiBoxData = useCallback(async () => {
		setSpecialDauDuoiBoxLoading(true);
		setSpecialDauDuoiBoxError(null);
		try {
			// Sử dụng API getSpecialDetailedStats thay vì tính toán client-side
			const detailedStats = await apiMB.getSpecialDetailedStats(SPECIAL_DAU_DUOI_DAYS);
			
			if (detailedStats) {
				// Sử dụng dữ liệu từ API
				setSpecialDauDuoiMetadata(detailedStats.metadata || {});
				setSpecialDauGanTop(detailedStats.dauGaps || []);
				setSpecialDuoiGanTop(detailedStats.duoiGaps || []);
				setSpecialDauHotTop((detailedStats.dauFrequency || []).slice(0, 5));
				setSpecialDuoiHotTop((detailedStats.duoiFrequency || []).slice(0, 5));
			} else {
				// Fallback: tính toán như cũ nếu API chưa có dữ liệu
				console.warn('Thống kê chi tiết chưa có, đang tính toán client-side...');
				const special = await apiMB.getSpecialStats(SPECIAL_DAU_DUOI_DAYS);
				setSpecialDauDuoiMetadata(special?.metadata || {});
				const records = special?.statistics || [];

				const parseVNDate = (dateStr) => {
					if (!dateStr || typeof dateStr !== 'string') return null;
					const [day, month, year] = dateStr.split('/');
					if (!day || !month || !year) return null;
					const parsed = new Date(Number(year), Number(month) - 1, Number(day));
					return isNaN(parsed.getTime()) ? null : parsed;
				};

				const parsedRecords = records
					.map(rec => {
						const dateObj = parseVNDate(rec?.drawDate);
						const numberStr = rec?.number ? String(rec.number) : null;
						if (!dateObj || !numberStr) return null;
						const lastTwo = numberStr.slice(-2).padStart(2, '0');
						const dau = parseInt(lastTwo[0], 10);
						const duoi = parseInt(lastTwo[1], 10);
						if (Number.isNaN(dau) || Number.isNaN(duoi)) return null;
						return { date: dateObj, dau, duoi };
					})
					.filter(Boolean)
					.sort((a, b) => b.date - a.date);

				const dauFreq = Array(10).fill(0);
				const duoiFreq = Array(10).fill(0);
				const dauLastSeen = Array(10).fill(null);
				const duoiLastSeen = Array(10).fill(null);

				parsedRecords.forEach(entry => {
					dauFreq[entry.dau]++;
					duoiFreq[entry.duoi]++;
					if (!dauLastSeen[entry.dau]) {
						dauLastSeen[entry.dau] = entry.date;
					}
					if (!duoiLastSeen[entry.duoi]) {
						duoiLastSeen[entry.duoi] = entry.date;
					}
				});

				const today = new Date();
				const dayMs = 24 * 60 * 60 * 1000;
				const buildGapList = (lastSeenArr) =>
					lastSeenArr
						.map((date, digit) => {
							const daysGap = date ? Math.max(0, Math.round((today - date) / dayMs)) : SPECIAL_DAU_DUOI_DAYS;
							return {
								digit,
								days: daysGap,
								lastDate: date ? date.toLocaleDateString('vi-VN') : null
							};
						})
						.sort((a, b) => (b.days || 0) - (a.days || 0));

				const totalDau = dauFreq.reduce((sum, val) => sum + val, 0);
				const totalDuoi = duoiFreq.reduce((sum, val) => sum + val, 0);

				const buildHotList = (freqArr, total) =>
					freqArr
						.map((count, digit) => ({
							digit,
							count,
							percentage: total > 0 ? `${((count / total) * 100).toFixed(2)}%` : '0%'
						}))
						.sort((a, b) => (b.count || 0) - (a.count || 0))
						.slice(0, 5);

				setSpecialDauGanTop(buildGapList(dauLastSeen));
				setSpecialDuoiGanTop(buildGapList(duoiLastSeen));
				setSpecialDauHotTop(buildHotList(dauFreq, totalDau));
				setSpecialDuoiHotTop(buildHotList(duoiFreq, totalDuoi));
			}
		} catch (error) {
			console.error('Không thể tải box đầu đuôi đặc biệt:', error);
			setSpecialDauDuoiBoxError(error?.message || 'Không thể tải thống kê đầu đuôi đặc biệt.');
			setSpecialDauGanTop([]);
			setSpecialDuoiGanTop([]);
			setSpecialDauHotTop([]);
			setSpecialDuoiHotTop([]);
			setSpecialDauDuoiMetadata({});
		} finally {
			setSpecialDauDuoiBoxLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		fetchSpecialDauDuoiBoxData();
	}, [fetchSpecialDauDuoiBoxData]);

	// Cập nhật dữ liệu: gọi PUT rồi refetch
	const handleUpdateAll = useCallback(async () => {
		if (isUpdatingRef.current) {
			return;
		}

		try {
			isUpdatingRef.current = true;
			setLoading(true);
			setError(null);
			// Cập nhật lần lượt để giảm tải
			await apiMB.updateLoGanStats(60);
			await apiMB.updateTanSuatLotoStats(30);
			// Cập nhật đặc biệt để phục vụ các box đặc biệt
			await apiMB.updateSpecialStats(365);
			// Cập nhật thống kê chi tiết (tự động được tính khi updateSpecialStats, nhưng gọi thêm để đảm bảo)
			try {
				await apiMB.updateSpecialDetailedStats(365);
			} catch (e) {
				console.warn('Không thể cập nhật thống kê chi tiết:', e?.message);
			}
			await fetchData();
			await fetchSpecialDauDuoiBoxData();
		} catch (updateError) {
			console.error('Không thể cập nhật thống kê nhanh:', updateError);
			setError(updateError?.message || 'Không thể cập nhật dữ liệu thống kê');
			setLoading(false);
		} finally {
			isUpdatingRef.current = false;
		}
	}, [fetchData, fetchSpecialDauDuoiBoxData]);

	// Styles tối giản giống mẫu người dùng (inline để tránh CSS bloat) - Memoized để tránh tạo lại
	const boxStyle = useMemo(() => ({
		border: '1px solid #C4D2E3',
		background: '#FFFFFF',
		margin: '0',
		fontSize: '13px',
		lineHeight: 1.5
	}), []);

	const headerStyle = useMemo(() => ({
		background: '#3a8de0',
		color: '#FFFFFF',
		fontWeight: 700, // Use 700 for better mobile support
		padding: '6px 8px',
		// Ensure font-weight works on mobile
		WebkitFontSmoothing: 'antialiased',
		MozOsxFontSmoothing: 'grayscale'
	}), []);

	const headerRow = useMemo(() => ({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: isMobile ? '6px' : '8px',
		flexDirection: isMobile ? 'column' : 'row'
	}), [isMobile]);

	const headerUpdateBtn = useMemo(() => ({
		display: 'inline-flex',
		alignItems: 'center',
		gap: isMobile ? '4px' : '6px',
		background: 'transparent',
		color: '#FFFFFF',
		border: '1px solid rgba(255,255,255,0.7)',
		borderRadius: '4px',
		padding: isMobile ? '4px 6px' : '4px 8px',
		fontWeight: 700, // Use 700 for better mobile support
		fontSize: isMobile ? '13px' : '14px',
		cursor: 'pointer',
		// Ensure font-weight works on mobile
		WebkitFontSmoothing: 'antialiased',
		MozOsxFontSmoothing: 'grayscale'
	}), [isMobile]);

	const sectionTitleStyle = useMemo(() => ({
		padding: '5px',
		margin: 0,
		color: '#0141B6',
		fontWeight: 700, // Use 700 for better mobile support
		fontSize: '16px',
		background: '#D5E9FD',
		// Ensure font-weight works on mobile
		WebkitFontSmoothing: 'antialiased',
		MozOsxFontSmoothing: 'grayscale'
	}), []);

	// Grid badge style như ảnh mẫu
	const listWrapStyle = useMemo(() => ({
		display: 'flex',
		flexWrap: 'wrap',
		gap: '8px',
		padding: '8px'
	}), []);

	const groupWrapStyle = useMemo(() => ({
		display: 'flex',
		flexWrap: isMobile ? 'wrap' : 'nowrap',
		gap: '8px',
		padding: '8px',
		rowGap: isMobile ? '6px' : '8px'
	}), [isMobile]);

	const groupBoxStyle = useMemo(() => ({
		border: '1px solid #C4D2E3',
		padding: isMobile ? '2px' : '6px',
		display: 'inline-flex',
		flexDirection: 'column',
		gap: '6px',
		background: '#fff'
	}), [isMobile]);

	const itemBoxStyle = useMemo(() => ({
		border: '1px solid #9ec3ef',
		borderRadius: '3px',
		padding: '4px 6px',
		display: 'inline-flex',
		alignItems: 'center',
		gap: '5px',
		background: '#fff'
	}), []);

	const numStyle = useMemo(() => {
		const style = { 
			color: '#d70000', 
			fontWeight: 700, 
			minWidth: 22, 
			textAlign: 'center'
		};
		// Tăng font-size lên 2px trên mobile
		if (isMobile) {
			style.fontSize = '14px'; // Tăng 2px so với desktop (12px -> 14px)
		} else {
			style.fontSize = '12px'; // Font-size mặc định trên desktop
		}
		return style;
	}, [isMobile]);
	const valStyle = useMemo(() => {
		const style = { 
			color: '#0a8a2a', 
			fontWeight: 700
		};
		// Tăng font-size lên 2px trên mobile
		if (isMobile) {
			style.fontSize = '14px'; // Tăng 2px so với desktop (12px -> 14px)
		} else {
			style.fontSize = '12px'; // Font-size mặc định trên desktop
		}
		return style;
	}, [isMobile]);

	const loCapCell = useMemo(() => ({
		borderRadius: '4px 4px 0 0',
		position: 'relative',
		display: 'flex',
		alignItems: 'flex-end',
		justifyContent: 'center',
		width: isMobile ? '40px' : '48px',
		background: '#b3a6ff',
		fontWeight: 700,
		color: '#fff',
		boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
	}), [isMobile]);

	const loCapBadge = useMemo(() => ({
		position: 'absolute',
		bottom: '100%',
		left: '50%',
		transform: 'translate(-50%, -4px)', // đẩy lên 4px phía trên đỉnh cột
		fontSize: '11px',
		color: '#2563eb',
		pointerEvents: 'none',
		whiteSpace: 'nowrap'
	}), []);

	const barNumberStyle = useMemo(() => ({
		paddingBottom: '6px',
		fontSize: isMobile ? '14px' : '16px'
	}), [isMobile]);

	const barColors = useMemo(() => ['#b3a6ff', '#6a77ff'], []); // trái / phải

	const calcBarHeight = useCallback((days, maxDaysInPairs) => {
		const maxPx = 110;
		const minPx = 40;
		if (!maxDaysInPairs || maxDaysInPairs <= 0) return minPx;
		const h = Math.round((days / maxDaysInPairs) * maxPx);
		return Math.max(minPx, Math.min(maxPx, h));
	}, []);

	// Bar style cho tổng/chạm
	const singleBarCell = useMemo(() => ({
		borderRadius: '4px 4px 0 0',
		position: 'relative',
		display: 'flex',
		alignItems: 'flex-end',
		justifyContent: 'center',
		width: isMobile ? '32px' : '38px',
		background: '#f6a6ff',
		fontWeight: 700,
		color: '#fff',
		boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
	}), [isMobile]);

	const singleBarNumber = useMemo(() => ({
		paddingBottom: '6px',
		fontSize: isMobile ? '12px' : '14px'
	}), [isMobile]);

	const maxDauGap = useMemo(() => {
		if (!specialDauGanTop || specialDauGanTop.length === 0) {
			return 1;
		}
		return Math.max(1, ...specialDauGanTop.map(item => item?.days || 0));
	}, [specialDauGanTop]);

	const maxDuoiGap = useMemo(() => {
		if (!specialDuoiGanTop || specialDuoiGanTop.length === 0) {
			return 1;
		}
		return Math.max(1, ...specialDuoiGanTop.map(item => item?.days || 0));
	}, [specialDuoiGanTop]);

	const topDauGap = useMemo(() => specialDauGanTop?.[0], [specialDauGanTop]);
	const topDuoiGap = useMemo(() => specialDuoiGanTop?.[0], [specialDuoiGanTop]);

	// Memoize các groups để tránh tính toán lại
	const loGanGroups = useMemo(() => {
		const groups = [];
		for (let i = 0; i < loGanTop.length; i += 5) {
			groups.push(loGanTop.slice(i, i + 5));
		}
		return groups;
	}, [loGanTop]);

	const tanSuatGroups = useMemo(() => {
		const groups = [];
		for (let i = 0; i < tanSuatTop.length; i += 5) {
			groups.push(tanSuatTop.slice(i, i + 5));
		}
		return groups;
	}, [tanSuatTop]);

	const specialGapGroups = useMemo(() => {
		const groups = [];
		for (let i = 0; i < specialGapTop.length; i += 5) {
			groups.push(specialGapTop.slice(i, i + 5));
		}
		return groups;
	}, [specialGapTop]);

	const specialBoGanGroups = useMemo(() => {
		const groups = [];
		for (let i = 0; i < specialBoGanTop.length; i += 5) {
			groups.push(specialBoGanTop.slice(i, i + 5));
		}
		return groups;
	}, [specialBoGanTop]);

	const specialBoHotGroups = useMemo(() => {
		return [
			{ label: 'Top 10', items: specialBoHotTop.slice(0, 10), startIdx: 1 },
			{ label: 'Top 20', items: specialBoHotTop.slice(10, 20), startIdx: 11 },
			{ label: 'Top 30', items: specialBoHotTop.slice(20, 30), startIdx: 21 },
			{ label: 'Top 40', items: specialBoHotTop.slice(30, 40), startIdx: 31 },
			{ label: 'Top 50', items: specialBoHotTop.slice(40, 50), startIdx: 41 }
		];
	}, [specialBoHotTop]);

	const maxDaysInLoCapPairs = useMemo(() => {
		return loCapGanPairs.reduce((m, p) => Math.max(m, p.aDays, p.bDays), 0);
	}, [loCapGanPairs]);

	const maxDaysInSumGaps = useMemo(() => {
		return Math.max(...specialSumGaps.map(s => s.days));
	}, [specialSumGaps]);

	const maxDaysInChamGaps = useMemo(() => {
		return Math.max(...specialChamGaps.map(c => c.days));
	}, [specialChamGaps]);

	const topSumGap = useMemo(() => {
		const sorted = [...specialSumGaps].sort((a, b) => b.days - a.days);
		return sorted[0] || null;
	}, [specialSumGaps]);

	const topSumGapPairs = useMemo(() => {
		if (!topSumGap) return [];
		const pairs = [];
		for (let i = 0; i <= 9; i++) {
			for (let j = 0; j <= 9; j++) {
				if (((i + j) % 10) === topSumGap.sum) {
					pairs.push(`${i}${j}`.padStart(2, '0'));
				}
			}
		}
		return [...new Set(pairs)].slice(0, 10);
	}, [topSumGap]);

	const topChamGap = useMemo(() => {
		const sorted = [...specialChamGaps].sort((a, b) => b.days - a.days);
		return sorted[0] || null;
	}, [specialChamGaps]);

	if (loading) {
		return (
			<div style={boxStyle}>
				<div style={headerStyle}>
					<div style={headerRow}>
						<div>THỐNG KÊ NHANH CHO NGÀY {todayStr}</div>
						<button onClick={handleUpdateAll} style={headerUpdateBtn} title="Cập nhật dữ liệu">
							<RefreshCw size={16} />
							<span>Cập nhật dữ liệu</span>
						</button>
					</div>
				</div>
				<div style={{ padding: '8px' }}>Đang tải dữ liệu...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div style={boxStyle}>
				<div style={headerStyle}>
					<div style={headerRow}>
						<div>THỐNG KÊ NHANH CHO NGÀY {todayStr}</div>
						<button onClick={handleUpdateAll} style={headerUpdateBtn} title="Cập nhật dữ liệu">
							<RefreshCw size={16} />
							<span>Cập nhật dữ liệu</span>
						</button>
					</div>
				</div>
				<div style={{ padding: '8px', color: '#B70000' }}>{error}</div>
			</div>
		);
	}

	return (
		<div id="tknhanh" style={boxStyle}>
			<div style={headerStyle}>
				<div style={headerRow}>
					<div>THỐNG KÊ NHANH CHO NGÀY {todayStr}</div>
					<button onClick={handleUpdateAll} style={headerUpdateBtn} title="Cập nhật dữ liệu">
						<RefreshCw size={16} />
						<span>Cập nhật dữ liệu</span>
					</button>
				</div>
			</div>
			<div style={{ border: '#C4D2E3 1px solid' }}>
				<div style={sectionTitleStyle}>Lotto lâu chưa ra (lô gan):</div>
				<div style={groupWrapStyle}>
					{loGanGroups.map((group, gIdx) => (
						<div key={`g-${gIdx}`} style={groupBoxStyle}>
							{group.map((item, idx) => (
								<div key={`gan-${gIdx}-${idx}`} style={itemBoxStyle}>
									<span style={numStyle}>{item.number}</span>
									<span style={valStyle}>{item.days} ngày</span>
								</div>
							))}
						</div>
					))}
				</div>

				{/* Các cặp lotto dẫn đầu bảng gan */}
				<div style={{ padding: '5px' }}>
					<div style={{ margin: '5px', color: '#0141B6', fontSize: '16px', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
						Các cặp lotto dẫn đầu bảng gan:
					</div>
					<ul style={{ margin: 0, paddingLeft: '15px' }}>
						{loGanTop.slice(0, 2).map((item, idx) => (
							<li key={`lead-gan-${idx}`} style={{ marginBottom: '4px' }}>
								Cặp số <b style={{ color: '#8E00CC', fontSize: '14px' }}>{item.number}</b> đã{' '}
								<b style={{ color: '#003ECC' }}>{item.days}</b> ngày chưa ra{' '}
								<span style={{ fontStyle: 'italic', color: '#666' }}>(xem chi tiết lịch sử trong trang thống kê)</span>
							</li>
						))}
					</ul>
					<div style={{ margin: '5px 3px', fontSize: '11px', color: '#8B8B8B' }}>
						(Kết quả thống kê dựa trên dữ liệu gần đây trong hệ thống)
					</div>
				</div>

				{/* Các cặp lô tô lộn cùng gan nhiều nhất */}
				<div style={{ padding: '5px' }}>
					<div style={{ margin: '5px 0 30px 0', fontSize: '16px', color: '#3C3C3C', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
						Các cặp lô tô lộn cùng gan nhiều nhất:
					</div>
					<div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'flex-end' }}>
						{loCapGanPairs.map((pair, idx) => (
							<div key={`pair-${idx}`} style={{ display: 'flex', alignItems: 'flex-end', margin: '0 6px 0 0' }}>
								<div
									style={{
										...loCapCell,
										background: barColors[0],
										height: `${calcBarHeight(pair.aDays, maxDaysInLoCapPairs)}px`
									}}
								>
									<div style={loCapBadge}>{pair.aDays} ng</div>
									<div style={barNumberStyle}>{pair.aNumber}</div>
								</div>
								<div style={{ width: '0px' }} />
								<div
									style={{
										...loCapCell,
										background: barColors[1],
										height: `${calcBarHeight(pair.bDays, maxDaysInLoCapPairs)}px`
									}}
								>
									<div style={loCapBadge}>{pair.bDays} ng</div>
									<div style={barNumberStyle}>{pair.bNumber}</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div style={{ ...sectionTitleStyle, marginTop: '8px' }}>Lotto ra nhiều trong 30 ngày qua:</div>
				<div style={groupWrapStyle}>
					{tanSuatGroups.map((group, gIdx) => (
						<div key={`tsg-${gIdx}`} style={groupBoxStyle}>
							{group.map((item, idx) => (
								<div key={`ts-${gIdx}-${idx}`} style={itemBoxStyle}>
									<span style={numStyle}>{item.number}</span>
									<span style={valStyle}>{item.count} lần</span>
								</div>
							))}
						</div>
					))}
				</div>
			</div>

			{/* Đặc biệt lâu chưa ra */}
			{specialGapTop.length > 0 && (
				<div style={{ border: '#C4D2E3 1px solid', marginTop: '10px' }}>
					<div style={{ padding: '5px', marginTop: '10px', color: '#B70000', fontWeight: 700, background: '#FDECD5', fontSize: '15px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
						Đặc biệt lâu chưa ra:
					</div>
					<div style={groupWrapStyle}>
						{specialGapGroups.map((group, gIdx) => (
							<div key={`spg-${gIdx}`} style={groupBoxStyle}>
								{group.map((item, idx) => (
									<div key={`sp-${gIdx}-${idx}`} style={itemBoxStyle}>
										<span style={numStyle}>{item.number}</span>
										<span style={valStyle}>{item.days} ngày</span>
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Thống kê gan đặc biệt theo tổng */}
			{specialSumGaps.length === 10 && (
				<div style={{ padding: '5px' }}>
					<div style={{ margin: '5px 0 0 0', color: '#770060', fontWeight: 700, fontSize: '15px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
						Thống kê gan đặc biệt theo tổng:
					</div>
					<div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '10px' }}>
						{specialSumGaps.map((s, idx) => (
							<div key={`sum-${idx}`} style={{ display: 'inline-block', margin: '20px 5px 0 0' }}>
								<div
									style={{
										...singleBarCell,
										height: `${calcBarHeight(s.days, maxDaysInSumGaps)}px`,
										background: '#f6a6ff'
									}}
									title={`Tổng ${s.sum}: ${s.days} ngày`}
								>
									<div style={loCapBadge}>{s.days} ng</div>
									<div style={singleBarNumber}>{s.sum}</div>
								</div>
							</div>
						))}
					</div>
					{topSumGap && (
						<div style={{ padding: '5px 0' }}>
							Thống kê cho thấy tổng đề lâu chưa xuất hiện nhất là tổng {topSumGap.sum} (bao gồm 10 cặp số: <span style={{ color: '#A901D3', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>{topSumGapPairs.join(', ')}</span>) đã {topSumGap.days} ngày chưa ra.
						</div>
					)}
				</div>
			)}

			{/* Thống kê gan đặc biệt theo chạm */}
			{specialChamGaps.length === 10 && (
				<div style={{ padding: '5px' }}>
					<div style={{ margin: '5px 0 0 0', color: '#C20171', fontWeight: 700, fontSize: '15px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
						Thống kê gan đặc biệt theo chạm:
					</div>
					<div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '10px' }}>
						{specialChamGaps.map((c, idx) => (
							<div key={`cham-${idx}`} style={{ display: 'inline-block', margin: '20px 5px 0 0' }}>
								<div
									style={{
										...singleBarCell,
										height: `${calcBarHeight(c.days, maxDaysInChamGaps)}px`,
										background: '#ffa6d6'
									}}
									title={`Chạm ${c.cham}: ${c.days} ngày`}
								>
									<div style={loCapBadge}>{c.days} ng</div>
									<div style={singleBarNumber}>{c.cham}</div>
								</div>
							</div>
						))}
					</div>
					{topChamGap && (
						<div style={{ padding: '5px 0' }}>
							Thống kê cho thấy chạm đề lâu chưa xuất hiện nhất là chạm {topChamGap.cham}, đã {topChamGap.days} ngày chưa ra.
						</div>
					)}
				</div>
			)}

			{/* Thống kê gan đặc biệt theo bộ */}
			{specialBoGanTop.length > 0 && (
				<div style={{ border: '#C4D2E3 1px solid', marginTop: '10px' }}>
					<div style={{ padding: '5px', marginTop: '10px', color: '#8E00CC', fontWeight: 700, background: '#F0E6FF', fontSize: '15px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
						Thống kê gan đặc biệt theo bộ (1 năm):
					</div>
					<div style={groupWrapStyle}>
						{specialBoGanGroups.map((group, gIdx) => (
							<div key={`bog-${gIdx}`} style={groupBoxStyle}>
								{group.map((item, idx) => (
									<div key={`bo-${gIdx}-${idx}`} style={itemBoxStyle}>
										<span style={numStyle}>Bộ {item.setId}</span>
										<span style={valStyle}>{item.days} ngày</span>
									</div>
								))}
							</div>
						))}
					</div>
					{(() => {
						const top = specialBoGanTop[0];
						if (!top) return null;
						return (
							<div style={{ padding: '5px' }}>
								<div style={{ margin: '5px 0', fontSize: '14px', color: '#8E00CC' }}>
									Thống kê cho thấy bộ số đặc biệt lâu chưa xuất hiện nhất là <b>Bộ {top.setId}</b>, đã <b>{top.days}</b> ngày chưa ra
									{top.lastDate && <span style={{ color: '#666', fontSize: '12px' }}> (lần cuối: {top.lastDate})</span>}.
								</div>
							</div>
						);
					})()}

					{/* Bộ ra nhiều nhất - 5 cột 10 dòng */}
					{specialBoHotTop.length > 0 && (
						<div style={{ padding: '5px', marginTop: '15px', borderTop: '1px solid #E0E0E0' }}>
							<div style={{ margin: '5px 0 10px 0', fontSize: '16px', fontWeight: 700, color: '#0141B6', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
								Bộ số đặc biệt ra nhiều nhất:
							</div>
							<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
								{specialBoHotGroups.map((group, colIdx) => (
									<div key={`col-${colIdx}`} style={{ flex: '1 1 calc(20% - 6.4px)', minWidth: 'calc(20% - 6.4px)', maxWidth: 'calc(20% - 6.4px)' }}>
										<div style={groupBoxStyle}>
											{group.items.map((item, rowIdx) => (
												<div key={`bo-hot-${colIdx}-${rowIdx}`} style={itemBoxStyle}>
													<span style={numStyle}>Bộ {item.setId}</span>
													<span style={valStyle}>{item.count} lần</span>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			<div style={{ border: '#C4D2E3 1px solid', marginTop: '10px' }}>
				<div style={{ padding: '5px', marginTop: '10px', color: '#C20171', fontWeight: 700, background: '#FDECF5', fontSize: '15px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
					Thống kê gan đầu/đuôi giải đặc biệt theo 1 năm:
				</div>
				{specialDauDuoiBoxLoading && <div style={{ padding: '8px' }}>Đang tải thống kê đầu đuôi đặc biệt...</div>}
				{!specialDauDuoiBoxLoading && specialDauDuoiBoxError && (
					<div style={{ padding: '8px', color: '#B70000' }}>{specialDauDuoiBoxError}</div>
				)}
				{!specialDauDuoiBoxLoading && !specialDauDuoiBoxError && (
					<div style={{ padding: '5px' }}>
						<div style={{ margin: '5px 0', fontSize: '16px', fontWeight: 700, color: '#C20171', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
							Đầu giải đặc biệt lâu chưa ra:
						</div>
						<div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '10px' }}>
							{specialDauGanTop.map(item => (
								<div key={`dau-gap-${item.digit}`} style={{ display: 'inline-block', margin: '20px 5px 0 0' }}>
									<div
										style={{
											...singleBarCell,
											background: '#f6a6ff',
											height: `${calcBarHeight(item.days || 0, maxDauGap)}px`
										}}
										title={`Đầu ${item.digit}: ${item.days} ngày${item.lastDate ? ` (lần cuối ${item.lastDate})` : ''}`}
									>
										<div style={loCapBadge}>{item.days} ng</div>
										<div style={singleBarNumber}>{item.digit}</div>
									</div>
								</div>
							))}
						</div>
						{topDauGap && (
							<div style={{ padding: '5px 0', color: '#333', fontSize: '14px', lineHeight: '1.6' }}>
								Thống kê cho thấy <span style={{ color: '#C20171', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>đầu đặc biệt</span> lâu chưa xuất hiện nhất là đầu <span style={{ color: '#C20171', fontWeight: 700, fontSize: '16px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>{topDauGap.digit}</span>, đã <span style={{ color: '#B70000', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>{topDauGap.days} ngày</span> chưa ra.
							</div>
						)}

						<div style={{ margin: '20px 0 5px 0', fontSize: '16px', fontWeight: 700, color: '#C20171', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
							Đuôi giải đặc biệt lâu chưa ra:
						</div>
						<div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '10px' }}>
							{specialDuoiGanTop.map(item => (
								<div key={`duoi-gap-${item.digit}`} style={{ display: 'inline-block', margin: '20px 5px 0 0' }}>
									<div
										style={{
											...singleBarCell,
											background: '#ffa6d6',
											height: `${calcBarHeight(item.days || 0, maxDuoiGap)}px`
										}}
										title={`Đuôi ${item.digit}: ${item.days} ngày${item.lastDate ? ` (lần cuối ${item.lastDate})` : ''}`}
									>
										<div style={loCapBadge}>{item.days} ng</div>
										<div style={singleBarNumber}>{item.digit}</div>
									</div>
								</div>
							))}
						</div>
						{topDuoiGap && (
							<div style={{ padding: '5px 0', color: '#333', fontSize: '14px', lineHeight: '1.6' }}>
								Thống kê cho thấy <span style={{ color: '#C20171', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>đuôi đặc biệt</span> lâu chưa xuất hiện nhất là đuôi <span style={{ color: '#C20171', fontWeight: 700, fontSize: '16px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>{topDuoiGap.digit}</span>, đã <span style={{ color: '#B70000', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>{topDuoiGap.days} ngày</span> chưa ra.
							</div>
						)}

						<div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
							<div style={{ flex: '1 1 260px' }}>
								<div style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 700, color: '#0141B6', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
									Đầu đặc biệt ra nhiều nhất:
								</div>
								<div style={groupWrapStyle}>
									<div style={groupBoxStyle}>
										{specialDauHotTop.map(item => (
											<div key={`dau-hot-${item.digit}`} style={itemBoxStyle}>
												<span style={numStyle}>Đầu {item.digit}</span>
												<span style={valStyle}>
													{item.count} lần <span style={{ color: '#555', fontWeight: 500 }}>({item.percentage})</span>
												</span>
											</div>
										))}
									</div>
								</div>
							</div>

							<div style={{ flex: '1 1 260px' }}>
								<div style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 700, color: '#0141B6', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
									Đuôi đặc biệt ra nhiều nhất:
								</div>
								<div style={groupWrapStyle}>
									<div style={groupBoxStyle}>
										{specialDuoiHotTop.map(item => (
											<div key={`duoi-hot-${item.digit}`} style={itemBoxStyle}>
												<span style={numStyle}>Đuôi {item.digit}</span>
												<span style={valStyle}>
													{item.count} lần <span style={{ color: '#555', fontWeight: 500 }}>({item.percentage})</span>
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Box Dự đoán kết quả */}
			<div style={{ border: '#C4D2E3 1px solid', marginTop: '10px' }}>
				<div style={{ padding: '5px', marginTop: '10px', color: '#0141B6', fontWeight: 700, background: '#D5E9FD', fontSize: '15px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
					Dự đoán kết quả dựa trên thống kê:
				</div>
				<div style={{ padding: '10px' }}>
					<div style={{ marginBottom: '10px' }}>
						<label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
							Loại dự đoán:
						</label>
						<div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
							<label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
								<input
									type="radio"
									name="predictionType"
									value="loto"
									checked={predictionType === 'loto'}
									onChange={(e) => setPredictionType(e.target.value)}
									style={{ cursor: 'pointer' }}
								/>
								<span>Loto (2 số cuối tất cả các giải)</span>
							</label>
							<label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
								<input
									type="radio"
									name="predictionType"
									value="special"
									checked={predictionType === 'special'}
									onChange={(e) => setPredictionType(e.target.value)}
									style={{ cursor: 'pointer' }}
								/>
								<span>Đặc biệt (chỉ 2 số cuối giải đặc biệt)</span>
							</label>
						</div>
					</div>
					<div style={{ marginBottom: '10px' }}>
						<label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
							Nhập các số cần dự đoán (00-99, cách nhau bằng dấu phẩy hoặc khoảng trắng):
						</label>
						<input
							type="text"
							value={predictionNumbers}
							onChange={(e) => setPredictionNumbers(e.target.value)}
							placeholder="Ví dụ: 01, 15, 23, 45, 67 hoặc 01 15 23 45 67"
							style={{
								width: '100%',
								padding: '8px',
								border: '1px solid #C4D2E3',
								borderRadius: '4px',
								fontSize: '14px'
							}}
						/>
					</div>
					<div style={{ marginBottom: '10px' }}>
						<label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
							Khoảng thời gian thống kê:
						</label>
						<select
							value={predictionDays}
							onChange={(e) => setPredictionDays(Number(e.target.value))}
							style={{
								width: '100%',
								padding: '8px',
								border: '1px solid #C4D2E3',
								borderRadius: '4px',
								fontSize: '14px'
							}}
						>
							<option value={30}>30 ngày</option>
							<option value={60}>60 ngày</option>
							<option value={90}>90 ngày</option>
							<option value={365}>365 ngày (1 năm)</option>
						</select>
					</div>
					<button
						onClick={async () => {
							if (!predictionNumbers.trim()) {
								setPredictionError('Vui lòng nhập ít nhất một số');
								return;
							}
							
							setPredictionLoading(true);
							setPredictionError(null);
							setPredictionResult(null);
							
							try {
								// Parse numbers từ input
								const numbers = predictionNumbers
									.split(/[,\s]+/)
									.map(n => n.trim())
									.filter(n => /^\d{1,2}$/.test(n))
									.map(n => String(parseInt(n, 10)).padStart(2, '0'))
									.filter((n, idx, arr) => arr.indexOf(n) === idx); // Remove duplicates
								
								if (numbers.length === 0) {
									throw new Error('Không có số hợp lệ. Vui lòng nhập số từ 00-99');
								}
								
								const result = await apiMB.predictNumbers(numbers, predictionDays, predictionType);
								setPredictionResult(result);
							} catch (err) {
								setPredictionError(err?.message || 'Không thể dự đoán');
							} finally {
								setPredictionLoading(false);
							}
						}}
						disabled={predictionLoading || !predictionNumbers.trim()}
						style={{
							width: '100%',
							padding: '10px',
							background: predictionLoading ? '#ccc' : '#0141B6',
							color: '#fff',
							border: 'none',
							borderRadius: '4px',
							fontSize: '14px',
							fontWeight: 700, // Use 700 for better mobile support
							WebkitFontSmoothing: 'antialiased',
							MozOsxFontSmoothing: 'grayscale',
							cursor: predictionLoading ? 'not-allowed' : 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '8px'
						}}
					>
						<TrendingUp size={18} />
						{predictionLoading ? 'Đang dự đoán...' : 'Dự đoán kết quả'}
					</button>

					{predictionError && (
						<div style={{ marginTop: '10px', padding: '8px', background: '#FFE6E6', color: '#B70000', borderRadius: '4px', fontSize: '14px' }}>
							{predictionError}
						</div>
					)}

					{predictionResult && (
						<div style={{ marginTop: '15px' }}>
							<div style={{ marginBottom: '10px', padding: '8px', background: predictionResult.metadata?.type === 'loto' ? '#E8F5E9' : '#FFF3E0', borderRadius: '4px', fontSize: '13px', color: '#666' }}>
								<strong>Loại dự đoán:</strong> {predictionResult.metadata?.type === 'loto' ? 'Loto (2 số cuối tất cả các giải)' : 'Đặc biệt (chỉ 2 số cuối giải đặc biệt)'}
							</div>
							<div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
								<strong>Tổng quan:</strong> {predictionResult.summary?.totalNumbers} số | 
								Điểm trung bình: <strong>{predictionResult.summary?.averageScore}</strong> | 
								Cao nhất: <strong>{predictionResult.summary?.maxScore}</strong> | 
								Thấp nhất: <strong>{predictionResult.summary?.minScore}</strong>
							</div>

							{/* Phân loại theo khả năng xuất hiện */}
							{predictionResult.categories && (
								<>
									{/* Khả năng cao nhất */}
									<div style={{ marginTop: '15px', marginBottom: '10px' }}>
										<div style={{ fontSize: '16px', fontWeight: 700, color: '#0a8a2a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
											<span>✓</span>
											<span>{predictionResult.categories.high?.label} ({predictionResult.categories.high?.count} số)</span>
										</div>
										<div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
											{predictionResult.categories.high?.description}
										</div>
										<div style={groupWrapStyle}>
											{predictionResult.categories.high?.predictions?.map((pred, idx) => (
												<div key={`high-${idx}`} style={{ ...itemBoxStyle, borderColor: '#0a8a2a', background: '#E8F5E9' }}>
													<span style={numStyle}>#{pred.rank} {pred.number}</span>
													<span style={{ ...valStyle, color: '#0a8a2a', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
														{pred.score} điểm
													</span>
												</div>
											))}
										</div>
									</div>

									{/* Khả năng trung bình */}
									<div style={{ marginTop: '15px', marginBottom: '10px' }}>
										<div style={{ fontSize: '16px', fontWeight: 700, color: '#FFA500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
											<span>○</span>
											<span>{predictionResult.categories.medium?.label} ({predictionResult.categories.medium?.count} số)</span>
										</div>
										<div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
											{predictionResult.categories.medium?.description}
										</div>
										<div style={groupWrapStyle}>
											{predictionResult.categories.medium?.predictions?.map((pred, idx) => (
												<div key={`medium-${idx}`} style={{ ...itemBoxStyle, borderColor: '#FFA500', background: '#FFF8E1' }}>
													<span style={numStyle}>#{pred.rank} {pred.number}</span>
													<span style={{ ...valStyle, color: '#FFA500', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
														{pred.score} điểm
													</span>
												</div>
											))}
										</div>
									</div>

									{/* Khả năng thấp */}
									<div style={{ marginTop: '15px', marginBottom: '10px' }}>
										<div style={{ fontSize: '16px', fontWeight: 700, color: '#d70000', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
											<span>●</span>
											<span>{predictionResult.categories.low?.label} ({predictionResult.categories.low?.count} số)</span>
										</div>
										<div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
											{predictionResult.categories.low?.description}
										</div>
										<div style={groupWrapStyle}>
											{predictionResult.categories.low?.predictions?.map((pred, idx) => (
												<div key={`low-${idx}`} style={{ ...itemBoxStyle, borderColor: '#d70000', background: '#FFEBEE' }}>
													<span style={numStyle}>#{pred.rank} {pred.number}</span>
													<span style={{ ...valStyle, color: '#d70000', fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
														{pred.score} điểm
													</span>
												</div>
											))}
										</div>
									</div>
								</>
							)}

							{/* Chi tiết từng số */}
							<div style={{ marginTop: '15px' }}>
								<div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#0141B6', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
									Chi tiết điểm số:
								</div>
								<div style={{ maxHeight: '300px', overflowY: 'auto' }}>
									{predictionResult.predictions?.map((pred, idx) => (
										<div key={`pred-detail-${idx}`} style={{ 
											padding: '8px', 
											marginBottom: '5px', 
											background: idx < 3 ? '#E8F5E9' : '#fff',
											border: '1px solid #C4D2E3',
											borderRadius: '4px',
											fontSize: '13px'
										}}>
											<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
												<span style={{ fontWeight: 700, color: '#0141B6', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
													#{pred.rank} Số {pred.number}
												</span>
												<span style={{ fontWeight: 700, fontSize: '16px', color: pred.score > 40 ? '#0a8a2a' : pred.score > 30 ? '#FFA500' : '#d70000', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
													{pred.score} điểm
												</span>
											</div>
											<div style={{ fontSize: '11px', color: '#666', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
												{predictionResult.metadata?.type === 'loto' ? (
													<>
														<span>Gan loto: {pred.factors?.gan?.toFixed(1) || 0}</span>
														<span>Loto ra nhiều: {pred.factors?.hot?.toFixed(1) || 0}</span>
														<span>Tần suất lô cặp: {pred.factors?.loCap?.toFixed(1) || 0}</span>
													</>
												) : (
													<>
														<span>Gan đặc biệt: {pred.factors?.gan?.toFixed(1) || 0}</span>
														<span>Đặc biệt ra nhiều: {pred.factors?.hot?.toFixed(1) || 0}</span>
														<span>Đầu: {pred.factors?.dau?.toFixed(1) || 0}</span>
														<span>Đuôi: {pred.factors?.duoi?.toFixed(1) || 0}</span>
														<span>Bộ: {pred.factors?.bo?.toFixed(1) || 0}</span>
														<span>Chạm: {pred.factors?.cham?.toFixed(1) || 0}</span>
														<span>Tổng: {pred.factors?.sum?.toFixed(1) || 0}</span>
													</>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

export default ThongKeNhanh;


