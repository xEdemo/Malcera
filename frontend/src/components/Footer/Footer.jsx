import { memo } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer-container">
            <h2>Site Map</h2>
            <ul className="footer-box">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/leaderboards">Leaderboards</Link>
                </li>
                <li>
                    <Link to="/forum">Forum</Link>
                </li>
                <li>
                    <Link to="/manual">Manual</Link>
                </li>
                <li>
                    <Link to="/signup">Sign Up</Link>
                </li>
                <li>
                    <Link to="/login">Login</Link>
                </li>
            </ul>
            <h2 style={{marginTop: '2rem'}}>Additional Links</h2>
            <ul className="footer-box">
                <li>
                    <Link to="#">Patch Notes</Link>
                </li>
                <li>
                    <Link to="#">Rules</Link>
                </li>
                <li>
                    <Link to="#">Support</Link>
                </li>
                <li>
                    <Link to="#">Cookies</Link>
                </li>
                <li>
                    <Link to="#">Privacy</Link>
                </li>
                <li>
                    <Link to="#">Terms</Link>
                </li>
            </ul>
            <div>
                <p style={{ textAlign: 'center' }}>©2023 Malcera</p>
            </div>
            <div>
                <p>Socials go here</p>
            </div>
        </footer>
    );
};
export default memo(Footer);
