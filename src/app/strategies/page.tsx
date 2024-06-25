'use client';

// TODO: complete datatable and util files.
// import DataTable from '../../components/table/dataTable';
// import Util from '../utils/util';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const strayegyList: React.FC = () => {
    const [tableData, setTableData] = useState();

    // todo: fetch data from backend
    // useEffect(() => {
    //     const queryStrategies = async () => {
    //       try {
    //         const response = await axios.get('/api/v1/strategies');
    //         setTableData(response.data);
    //       } catch (error) {
    //         console.error(error);
    //       }
    //     };
    //     queryStrategies();
    //   }, []);

    const [isDisabled, setIsDisabled] = useState(false);
    
    const switchStrategyStatus = () => {
        setIsDisabled(!isDisabled);
    };

    const getClassNameForProfit = (profit) => {
        return profit >= 0 ? 'has-text-success' : 'has-text-danger';
    };

    const getClassNameForPercentage = (percentage) => {
        return percentage >= 0 ? 'has-text-success' : 'has-text-danger';
    };

    const getClassNameForStatus = (status) => {
        return status === 'Normal' ? 'has-text-success' : 'has-text-danger';
    };
    
    //for testing
    const data = [
        {
            title: '2024-1-1',
            exchange: 'Exchange1',
            symbol: 'Symbol1',
            quoteTotal: 1000,
            priceNative: 10.5,
            priceAverage: 10.0,
            profit: 50,
            profitPercentage: 5,
            status: 'Normal'
        },
        {
            title: '2024-1-2',
            exchange: 'Exchange2',
            symbol: 'Symbol2',
            quoteTotal: 2000,
            priceNative: 1,
            priceAverage: 20.0,
            profit: -20,
            profitPercentage: -5,
            status: 'Normal'
        },
    ];

    const editStrategy = useCallback((strategyId) => {
    }, []);

    const viewStrategy = useCallback((strategy) => {
    }, []);
        
    return (
    <div className='container'>
        <section className='section'>
        <div className='box'>
            <a href='/newStrategy' className='tabs' >
                New Strategy
            </a>
            <div className='tabs'>
            <ul>
                <li className='is-active'><a>Investment Plans</a></li>
            </ul>
            </div>
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
            {data.map((row, index) => (
                <tr key={index}>
                    <td>{row.title}</td>
                    <td>{row.exchange}</td>
                    <td>{row.symbol}</td>
                    <td>{row.quoteTotal}</td>
                    <td>{row.priceNative}</td>
                    <td>{row.priceAverage}</td>
                    <td className={getClassNameForProfit(row.profit)}>{row.profit}</td>
                    <td className={getClassNameForPercentage(row.profitPercentage)}>{row.profitPercentage}%</td>
                    <td className={getClassNameForStatus(row.status)}>{row.status}</td>
                    <td>
                        <div className='flex'>
                        <a className='button is-small is-info is-outlined' 
                            onClick={editStrategy}>
                                Edit
                        </a>
                        <a className={`button is-small ${isDisabled ? 'is-success' : 'is-danger'} is-outlined`}
                            onClick={switchStrategyStatus}>
                                {isDisabled ? 'Enable' : 'Disable'}
                        </a>
                        <a className='button is-small is-primary is-outlined'
                            onClick={viewStrategy}>
                                View
                        </a>
                        </div>
                    </td>
                </tr>
            ))}
            </tbody>
            </table>
        </div>
        </section>
    </div>
    );
};

export default strayegyList;