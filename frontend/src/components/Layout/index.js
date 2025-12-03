import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="d-flex flex-column vh-100">
            <Header />
            <div className="d-flex flex-grow-1">
                <Sidebar />
                <div
                    className="flex-grow-1 p-4"
                    style={{
                        marginLeft: '250px',
                        paddingTop: '70px',
                        overflowY: 'auto',
                        backgroundColor: '#f8fafc',
                        minHeight: 'calc(100vh - 70px)'
                    }}
                >
                    <div className="container-fluid">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Layout;