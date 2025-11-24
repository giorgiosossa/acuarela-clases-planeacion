import { ImgHTMLAttributes } from 'react';

// You can use a path relative to your public directory or a webpack/vite alias if configured
const logoPath = '/images/logo-app.jpg';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    // We destructure props to apply attributes like className, style, etc., directly to the <img> tag
    return (
        <img
            {...props}
            style={{ width: '100%', height: '100%', borderRadius: '5px', ...props.style }}
            src={logoPath}
            alt="App Logo"
        />
    );
}
