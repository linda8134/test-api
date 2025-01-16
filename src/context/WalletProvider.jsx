import { createContext, useMemo, useState, useContext, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { DialogContent, DialogTitle, Typography } from '@mui/material';


export const WalletContext = createContext({
	address:'',
	setAddress: null,
	addressInfo: {},
	handleConnect: () => {}
});

export default function WalletProvider(props) {
	const [address, setAddress] = useState(localStorage.getItem('address'))
	const [addressInfo, setAddressInfo] = useState(JSON.parse(localStorage.getItem('addressInfo')))
	const [addresses, setAddresses] = useState([''])
	const [wallet, setWallet] = useState(null)
	const [selectAddressOpen, setSelectAddressOpen] = useState(false)

	const enableWallet = async () => {
		if(window.injectedWeb3['polkadot-js']){
      const wallet = window.injectedWeb3['polkadot-js']
      const enabledWallet = await wallet.enable();
			setWallet(enabledWallet)
			return enabledWallet;
		}
	}

	const handleConnect = async () => {
		const enabledWallet = await enableWallet();
		const accounts = await enabledWallet.accounts.get();
		setAddresses(accounts)
		setSelectAddressOpen(true)
  }

	useEffect(() => {
		if(!address){
			return
		}
		enableWallet();
	},[address])

	const handleSelectAddress = (address) => {
		setAddressInfo(address)
		setAddress(address.address);
		localStorage.setItem('address', address.address);
		localStorage.setItem('addressInfo', JSON.stringify(address));
		setSelectAddressOpen(false)
	}

	const disconnected = () => {
		setAddress('');
		setWallet(null);
	}

	const value = useMemo(() => {
		return {
			address,
			wallet,
			setAddress,
			handleConnect,
			disconnected,
			addressInfo
		};
	}, [
		address,
		setAddress,
		handleConnect,
		disconnected,
		wallet,
		addressInfo
	]);

	return (
		<>
			<WalletContext.Provider value={value}>{props?.children}</WalletContext.Provider>
			<SelectAddressDialog
				open={selectAddressOpen}
				onClose={() => setSelectAddressOpen(false)}
				accounts={addresses}
				handleSelectAddress={handleSelectAddress}
			/>
		</>
	);
}

const SelectAddressDialog = (props) => {
	const {open, onClose, accounts, handleSelectAddress} = props;
	return (
		<Dialog
			open={open}
			onClose={onClose}
		>
			<DialogTitle>Select Address</DialogTitle>
			<DialogContent>
				<Box className='space-y-4'>
					{accounts?.map(item => {
						return (
							<Box onClick={() => handleSelectAddress(item)} key={item?.address}>
								<Typography variant='body1' noWrap fontWeight={700}>{item.name}</Typography>
								<Typography color='text.secondary' variant='body2'>{item.address}</Typography>
							</Box>
						)
					})}
				</Box>
			</DialogContent>
		</Dialog>
	)
}


export function useWalletContext(){
	return useContext(WalletContext)
}
