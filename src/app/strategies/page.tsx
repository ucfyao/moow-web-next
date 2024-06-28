'use client';

// TODO: complete datatable and util files.
// import DataTable from '../../components/table/dataTable';
// import Util from '../utils/util';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { format } from 'date-fns';
import no_record from '../../assets/images/no_record.png';
import '../styles/strategies.css';

const strayegyList: React.FC = () => {

    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const queryStrategies = async () => {
            try {
                // todo: use baseURL instead of hardcode
                const response = await axios.get('http://127.0.0.1:3001/api/v1/strategies');
                setTableData(response.data.data);
            } catch (error) {
                console.error(error);
            }
        };
        queryStrategies();
    }, []);

    const getStatusText = (status: string): string => {
        switch (status) {
            case '1':
                return 'Normal';
            case '2':
                return 'Stopped';
            case '3':
                return 'Deleted';
            default:
                return 'Unknown';
        }
    };

    const switchStrategyStatus = (strategyId: string) => {
        setTableData((prevData) =>
            prevData.map((strategy) =>
                strategy._id === strategyId
                    ? { ...strategy, status: strategy.status === '1' ? '2' : '1' }
                    : strategy
            )
        );
    };

    const editStrategy = (strategyId: string) => {
        console.log('edit');
    };

    const viewStrategy = (strategyId: string) => {
        console.log('view');
    };
        
    return (
    <div className='container'>
        <section className='section'>
        <div className='box'>
            <a href='/strategy/new' className='tabs-more' > New Strategy </a>
            <div className='tabs'>
                <ul className='tabs'>
                    <li className='tabs is-active'><a> Investment Plans </a></li>
                </ul>
            </div>

            <div className='table-wrapper'>
            {tableData && tableData.length > 0 ? (
                <table className='table is-fullwidth is-striped' style={{ minWidth: '1050px', fontSize: '0.85rem' }}>
                    <thead>
                        <tr>
                            <th>Create At</th>
                            <th>Exchange</th>
                            <th>Symbol</th>
                            <th>Quote Total</th>
                            <th>Price Native</th>
                            <th>Price Average</th>
                            <th>Profit</th>
                            <th>Profit Percentage</th>
                            <th>Status</th>
                            <th>Operations</th>
                        </tr>
                    </thead>
                    
                        <tbody>
                        {tableData.map((row, index) => (
                            <tr key={index}>
                                <td>{format(new Date(row.createdAt), 'yyyy/MM/dd HH:mm')}</td>
                                <td>{row.exchange}</td>
                                <td>{row.symbol}</td>
                                <td>{row.quote_total}</td>
                                <td>{row.price_native}</td>
                                <td>{(row.base_total/row.quote_total).toString()}</td>
                                <td className={row.profit >= 0 ? 'has-text-success' : 'has-text-danger'}>{row.profit}</td>
                                <td className={row.profit_percentage >= 0 ? 'has-text-success' : 'has-text-danger'}>{row.profitPercentage}%</td>
                                <td className={row.status === '1' ? 'has-text-success' : 'has-text-danger'}>{getStatusText(row.status)}</td>

                                <td>
                                    <div className='flex'>
                                        <a className='button is-small is-info is-outlined' 
                                            onClick={() => editStrategy(row._id)}>
                                                Edit
                                        </a>
                                        <a className={`button is-small 
                                            ${row.status === '1' ? 'is-danger' : 'is-info'} is-outlined`}
                                            onClick={() => switchStrategyStatus(row._id)}>
                                                {row.status==='1' ? 'Disable' : 'Enable'}
                                        </a>
                                        <a className='button is-small is-primary is-outlined'
                                            onClick={() => viewStrategy(row._id)}>
                                                View 
                                        </a>
                                    </div>
                                </td>

                            </tr>
                        ))}
                        </tbody>
                </table>
            ) : (
                <Image src={no_record} alt='No records found' />
            )}
                
            </div>
        </div>
        </section>
    </div>
    );
};

export default strayegyList;