import { ArchidektDeckListHeaders, DragonShieldCard } from '../App';

const CardTableParsed = ({
	headers,
	cards,
}: {
	headers: Array<string>;
	cards: Array<DragonShieldCard> | Array<ArchidektDeckListHeaders>;
}) => {
	return (
		<>
			<table>
				<tr>
					{headers.map((header: string) => (
						<th key={header}>{header}</th>
					))}
				</tr>
				{cards.map((card: DragonShieldCard | ArchidektDeckListHeaders) => {
					const cardArray = headers.map((header: string) => (
						<td key={header}>{card[header]}</td>
					));
					return <tr key={card['Card Name']}>{cardArray.map(card => card)}</tr>;
				})}
			</table>
		</>
	);
};

export default CardTableParsed;
