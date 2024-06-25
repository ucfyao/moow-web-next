'use client';

// TODO: complete datatable and util files.
// import DataTable from "../../components/table/dataTable";
// import Util from "../utils/util";
import React, { useState, useEffect, useCallback } from 'react';

const strayegyList: React.FC = () => {
    const [tableData, setTableData] = useState({
        // Set the data table, or use react original component
    });

    useEffect(() => {
        queryStrategies();
    }, []);

    const queryStrategies = useCallback(async () => {
    }, []);

    const switchStrategyStatus = useCallback((strategy) => {
    }, []);

    const newStrategy = useCallback(() => {
    }, []);

    const editStrategy = useCallback((strategyId) => {
    }, []);

    const showStrategy = useCallback((strategy) => {
    }, []);
        
    return (
    <div className="container">
        <section className="section">
        <div className="box">
            <a className="tabs-more" onClick={newStrategy}>New Strategy</a>
            <div className="tabs">
            <ul>
                <li className="is-active"><a>'caption.investment_plans'</a></li>
                <li className="is-active"><a>'caption.investment_plans'</a></li>
                <li className="is-active"><a>'caption.investment_plans'</a></li>
                <li className="is-active"><a>'caption.investment_plans'</a></li>
                <li className="is-active"><a>'caption.investment_plans'</a></li>
            </ul>
            </div>
            {/* <data-table ref="dataTable" :table-data="tableData" :tableClass="'is-fullwidth is-striped'"
                        :tableStyle="{'min-width': '1050px', 'font-size': '0.85rem'}"></data-table> */}
        </div>
        </section>
    </div>
    );
};

export default strayegyList;