import styles from './footer.module.scss';

interface IFooter {
    className?: string
}

const Footer: React.FC<IFooter> = (props) => {
    return (
        <footer className={styles.footer + " " + props.className}>
            
        </footer>
    )
}

export default Footer;