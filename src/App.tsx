import {
	ChangeEvent,
	RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import Papa, { ParseResult } from 'papaparse';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Uploader } from './uploader/Uploader';
import styles from './App.module.css';
import { formatFileSize } from 'react-papaparse';
import CardTableParsed from './CardTable/CardTablePArsed';

const archidektFileHeaders =
	'Quantity,Card Name,Edition Name,Edition Code,Modifier,Collector Number\n';

const archidektDeckFileHeaders =
	'Quantity,Card Name,Edition Name,Edition Code,Category,Secondary Categories,Label,Modifier,Collector Number,Salt,Color,CMC,Rarity,Price,Collection Status\n';

enum CollectionStatus {
	NOT_OWNED = 'Not Owned',
	OWN_DIFFERENT_EDITION = 'Own Different Edition',
	OWN_EXACT_EDITION = 'Own Exact Edition',
}

export type ArchidektList = {
	Quantity: string;
	'Card Name': string;
	'Edition Name': string;
	'Edition Code': string;
	Modifier: string;
	'Collector Number': string;
};

export type ArchidektDeckListHeaders = {
	Quantity: string;
	'Card Name': string;
	'Edition Name': string;
	'Edition Code': string;
	Category: string;
	'Secondary Categories': string;
	Label: string;
	Modifier: string;
	'Collector Number': string;
	Salt: string;
	Color: string;
	CMC: string;
	Rarity: string;
	Price: string;
	'Collection Status': CollectionStatus;
};

export type DragonShieldCard = {
	'Folder Name': string;
	Quantity: string;
	'Trade Quantity': string;
	'Card Name': string;
	'Set Code': string;
	'Set Name': string;
	'Card Number': string;
	Condition: string;
	Printing: string;
	Language: string;
	'Price Bought': string;
	'Date Bought': string;
};

function App() {
	const [selectedFile, setSelectedFile] = useState<File | null>();
	const [archidektParsed, setArchidektParsed] = useState<
		ArchidektList[] | null
	>(null);
	const [archidektDeckParsed, setArchidektDeckParsed] = useState<
		ArchidektDeckListHeaders[] | null
	>(null);
	const [folderName, setFolderName] = useState<string>('');
	const [dragonShieldJSON, setDragonShieldJSON] = useState<
		DragonShieldCard[] | null
	>(null);
	const [dragonShieldDeckJSON, setDragonShieldDeckJSON] = useState<
		ArchidektDeckListHeaders[] | null
	>(null);

	useEffect(() => {
		setArchidektDeckParsed(null);
		setArchidektParsed(null);
		setDragonShieldJSON(null);
		setDragonShieldDeckJSON(null);
		setFolderName('');
	}, [selectedFile]);

	const inputRef: RefObject<HTMLInputElement | null> =
		useRef<HTMLInputElement>(null);

	const handleSelectedFile = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		setSelectedFile(file);
	};

	const handleParse = useCallback(() => {
		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>) => {
			const fileContent = e?.target?.result;
			const csvWithHeaders = archidektFileHeaders + fileContent;

			Papa.parse(csvWithHeaders, {
				header: true,
				skipEmptyLines: true,
				complete: (results: ParseResult<ArchidektList>) => {
					console.log(results);
					setArchidektParsed(results.data);
				},
			});
			console.log('finished parsing for collection');
		};
		if (selectedFile) {
			reader.readAsText(selectedFile);
		}
	}, [selectedFile]);

	const handleDeckParse = useCallback(() => {
		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>) => {
			const fileContent = e?.target?.result;
			const csvWithHeaders = archidektDeckFileHeaders + fileContent;

			Papa.parse(csvWithHeaders, {
				header: true,
				skipEmptyLines: true,
				complete: (results: ParseResult<ArchidektDeckListHeaders>) => {
					console.log(results);
					setArchidektDeckParsed(results.data);
				},
			});
			console.log('finished parsing for deck list');
		};
		if (selectedFile) {
			reader.readAsText(selectedFile);
		}
	}, [selectedFile]);

	const handleFolderNameBlur = (event: ChangeEvent<HTMLInputElement>) => {
		setFolderName(event.target.value);
	};

	const handleConvertToDSInventory = async () => {
		const newDragonShieldList = archidektParsed?.map((card: ArchidektList) => {
			return {
				'Folder Name': folderName!,
				Quantity: card.Quantity,
				'Trade Quantity': '0',
				'Card Name': card['Card Name'],
				'Set Code': card['Edition Code'],
				'Set Name': card['Edition Name'],
				'Card Number': card['Collector Number'],
				Condition: 'NearMint',
				Printing: card.Modifier === 'Etched' ? 'Foil' : card.Modifier,
				Language: 'English',
				'Price Bought': '0',
				'Date Bought': new Date().toISOString().split('T')[0],
			};
		});
		setDragonShieldJSON(newDragonShieldList ?? null);
		setDragonShieldDeckJSON(null);
	};

	const handleDownloadInventoryFile = useCallback(() => {
		const csv = Papa.unparse(dragonShieldJSON!);

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.href = url;
		link.download = `${folderName}.csv`;
		document.body.appendChild(link);
		link.click();

		URL.revokeObjectURL(url);
		document.body.removeChild(link);
	}, [dragonShieldJSON, folderName]);

	const handleConvertToDSDeckList = async () => {
		const newDragonShieldDeckList = archidektDeckParsed?.map(
			(card: ArchidektDeckListHeaders) => {
				return {
					Quantity: card.Quantity,
					'Card Name': card['Card Name'],
					'Edition Name': card['Edition Name'],
					'Edition Code': card['Edition Code'],
					Category: card.Category,
					'Secondary Categories': card['Secondary Categories'],
					Label: card.Label,
					Modifier: card.Modifier,
					'Collector Number': card['Collector Number'],
					Salt: card.Salt,
					Color: card.Color,
					CMC: card.CMC,
					Rarity: card.Rarity,
					Price: card.Price,
					'Collection Status': CollectionStatus.OWN_EXACT_EDITION,
				};
			}
		);
		setDragonShieldDeckJSON(newDragonShieldDeckList ?? null);
		setDragonShieldJSON(null);
	};

	const handleDownloadDeckListFile = useCallback(() => {
		const csv = Papa.unparse(dragonShieldDeckJSON!, { header: false });

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.href = url;
		link.download = `${
			selectedFile?.name.split('(')[0].trim().split('.')[0]
		}_decklist.csv`;
		document.body.appendChild(link);
		link.click();

		URL.revokeObjectURL(url);
		document.body.removeChild(link);
	}, [dragonShieldDeckJSON, selectedFile]);

	const handleBrowseClick = () => {
		inputRef?.current?.click();
	};

	return (
		<>
			<div>
				<a href='https://vite.dev' target='_blank'>
					<img src={viteLogo} className='logo' alt='Vite logo' />
				</a>
				<a href='https://react.dev' target='_blank'>
					<img src={reactLogo} className='logo react' alt='React logo' />
				</a>
			</div>
			<div id='uploader'>
				<Uploader />
			</div>
			<div id='homemade_uploader' className={styles.csvReader}>
				<button
					type='button'
					onClick={handleBrowseClick}
					className={styles.browseFile}
				>
					Browse File
				</button>
				<div className={styles.acceptedFile}>
					{selectedFile && (
						<p>
							{selectedFile.name + ' | ' + formatFileSize(selectedFile.size)}
						</p>
					)}
				</div>
				<button className={styles.browseFile} onClick={handleParse}>
					Parse File for Collection
				</button>
				<button className={styles.browseFile} onClick={handleDeckParse}>
					Parse File for Deck List
				</button>
				<input
					ref={inputRef}
					id='csvFile'
					type='file'
					style={{ display: 'none' }}
					onChange={handleSelectedFile}
				/>
			</div>
			{archidektParsed && (
				<div>
					<label>Inventory file parsed!</label>
				</div>
			)}
			{archidektParsed && (
				<div>
					<label htmlFor='folderName'>Folder Name</label>
					<input
						type='text'
						id='folderName'
						placeholder='Folder Name'
						value={folderName}
						onChange={handleFolderNameBlur}
					/>
				</div>
			)}
			{archidektDeckParsed && (
				<div>
					<label>Deck list file parsed!</label>
				</div>
			)}
			<div className={styles.convertButtons}>
				<button onClick={handleConvertToDSInventory} disabled={!folderName}>
					Convert to Dragon Shield Inventory
				</button>
				<button
					onClick={handleDownloadInventoryFile}
					disabled={!dragonShieldJSON && !folderName}
				>
					Download Dragonshield Inventory Import CSV
				</button>
			</div>
			<div className={styles.convertButtons}>
				<button
					onClick={handleConvertToDSDeckList}
					disabled={!archidektDeckParsed}
				>
					Convert to DragonShield Deck List
				</button>
				<button
					onClick={handleDownloadDeckListFile}
					disabled={!dragonShieldDeckJSON}
				>
					Download DragonShield Deck List CSV
				</button>
			</div>
			<div>
				{dragonShieldJSON && (
					<CardTableParsed
						headers={Object.keys(dragonShieldJSON[0])}
						cards={dragonShieldJSON}
					/>
				)}
			</div>
			<div>
				{dragonShieldDeckJSON && (
					<CardTableParsed
						headers={Object.keys(dragonShieldDeckJSON[0])}
						cards={dragonShieldDeckJSON}
					/>
				)}
			</div>
		</>
	);
}

export default App;
